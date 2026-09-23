"""梦幻西游藏宝阁门派映射爬虫。

从 game_auto_config.js 读出 school_info（id → 名字）。一门派对应一个名字，
表主键是 school_id。stdout 只输出执行器协议行。
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

MANIFEST_KEY = "mhxy-cbg-schools"
CONFIG_URL = "https://cbg-xyq.res.netease.com/js/game_auto_config.js"
CONFIG_PREFIX = "var CBG_GAME_CONFIG="


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


def insert_school(school_id: int, school_name: str) -> None:
    emit(
        "db_insert",
        {
            "tableName": "mhxy_cbg_schools",
            "value": {"school_id": school_id, "school_name": school_name},
        },
    )


def fetch_schools() -> list[tuple[int, str]]:
    response = requests.get(CONFIG_URL, timeout=30)
    response.raise_for_status()

    text = response.text.strip().removeprefix(CONFIG_PREFIX).removesuffix(";")
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("游戏配置不是对象")

    school_info = data.get("school_info")
    if not isinstance(school_info, dict) or not school_info:
        raise ValueError("school_info 为空或不是对象")

    schools: list[tuple[int, str]] = []
    for item, school_name in school_info.items():
        if not isinstance(item, str) or not item.isdigit():
            raise ValueError(f"无效的门派 id：{item}")
        if not isinstance(school_name, str) or not school_name.strip():
            raise ValueError(f"门派 {item} 缺少名称")
        schools.append((int(item), school_name))

    schools.sort(key=lambda school: school[0])
    return schools


def main() -> None:
    try:
        request = json.load(sys.stdin)
    except json.JSONDecodeError as error:
        fail(f"无法读取任务参数：{error}")

    if not isinstance(request, dict):
        fail("任务参数必须是 JSON 对象")

    if request.get("method") != "execute":
        fail(f"不支持的方法：{request.get('method')}")

    schools = fetch_schools()
    report_progress(0, len(schools))
    for index, (school_id, school_name) in enumerate(schools, start=1):
        insert_school(school_id, school_name)
        report_progress(index, len(schools))

    emit(
        "success",
        {
            "message": f"已获取 {len(schools)} 个门派",
            "data": {
                "school_count": len(schools),
                "school_info": {str(school_id): school_name for school_id, school_name in schools},
                "schools": [
                    {"school_id": school_id, "school_name": school_name} for school_id, school_name in schools
                ],
            },
        },
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except requests.RequestException as error:
        fail(f"获取门派映射失败：{error}")
    except Exception as error:
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        fail(str(error) or "抓取门派映射失败")
