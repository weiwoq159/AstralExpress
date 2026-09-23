"""梦幻西游藏宝阁召唤兽名称爬虫。

从 saleable_pet_name.js 读出 id → 名字。同一个名字可能对应多个 id，
表主键是 pet_id，重名各插一行。stdout 只输出执行器协议行。
"""

import json
import sys
from typing import Any, NoReturn

import requests


def _force_utf8_stdio() -> None:
    """Windows 上管道 stdout 默认是系统 ANSI 代码页。执行器按 UTF-8 读，中文 JSON 会报 stream did not contain valid UTF-8。"""
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            reconfigure(encoding="utf-8")


_force_utf8_stdio()

MANIFEST_KEY = "mhxy-cbg-pets"
PET_URL = "https://cbg-xyq.res.netease.com/js/saleable_pet_name.js?v=20190514"
PET_PREFIX = "var SaleablePetNameInfo = "


def emit(message_type: str, payload: dict[str, Any]) -> None:
    """打一行协议消息。stdout 被管道接走时是块缓冲，不 flush 执行器就看不到实时进度。"""
    print(
        json.dumps(
            {"type": message_type, "manifest": MANIFEST_KEY, "payload": payload},
            ensure_ascii=False,
        ),
        flush=True,
    )


def fail(message: str) -> NoReturn:
    emit("failed", {"message": message})
    raise SystemExit(1)


def report_progress(current_index: int, total: int) -> None:
    emit("process", {"currentIndex": current_index, "total": total})


def insert_pet(pet_id: int, name: str) -> None:
    emit(
        "db_insert",
        {"tableName": "mhxy_cbg_pets", "value": {"pet_id": pet_id, "name": name}},
    )


def fetch_pets() -> list[tuple[int, str]]:
    response = requests.get(PET_URL, timeout=30)
    response.raise_for_status()

    text = response.text.strip().removeprefix(PET_PREFIX).removesuffix(";")
    data = json.loads(text)
    if not isinstance(data, dict) or not data:
        raise ValueError("召唤兽名单为空或不是对象")

    pets: list[tuple[int, str]] = []
    for item, name in data.items():
        if not isinstance(item, str) or not item.isdigit():
            raise ValueError(f"无效的召唤兽 id：{item}")
        if not isinstance(name, str) or not name.strip():
            raise ValueError(f"召唤兽 {item} 缺少名称")
        # name 允许重复：同一个召唤兽名字会对应 1～2 个不同 id，主键是 pet_id。
        pets.append((int(item), name))
    return pets


def main() -> None:
    try:
        request = json.load(sys.stdin)
    except json.JSONDecodeError as error:
        fail(f"无法读取任务参数：{error}")

    if not isinstance(request, dict):
        fail("任务参数必须是 JSON 对象")

    if request.get("method") != "execute":
        fail(f"不支持的方法：{request.get('method')}")

    pets = fetch_pets()
    report_progress(0, len(pets))
    for index, (pet_id, name) in enumerate(pets, start=1):
        insert_pet(pet_id, name)
        report_progress(index, len(pets))

    emit(
        "success",
        {
            "message": f"已获取 {len(pets)} 个召唤兽",
            "data": {
                "pet_count": len(pets),
                "name_count": len({name for _, name in pets}),
                "pets": [{"pet_id": pet_id, "name": name} for pet_id, name in pets],
            },
        },
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except requests.RequestException as error:
        fail(f"获取召唤兽名单失败：{error}")
    except Exception as error:
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        fail(str(error) or "抓取召唤兽名单失败")
