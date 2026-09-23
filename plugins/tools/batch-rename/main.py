"""批量重命名工具的 Python 入口。"""

import json
import sys
import uuid
from pathlib import Path
from typing import Any


def report_progress(current_index: int, total: int) -> None:
    """向 Tauri 执行引擎汇报中间进度：按行打印一条 NDJSON 消息到 stdout。

    执行引擎按行读取 stdout：`type` 为 "process" 的行只更新进度，不当作最终结果；
    真正的最终结果是 main() 最后打印的那一行 `{"type": "success", "payload": {"data": ...}}`。
    每条 process 消息后必须 flush，否则会被 Python 的行缓冲攒住，执行引擎读不到实时进度。
    """
    print(
        json.dumps(
            {"type": "process", "payload": {"currentIndex": current_index, "total": total}}, ensure_ascii=False
        ),
        flush=True,
    )


def set_target_directory(source_path: Path, payload: dict[str, Any], index: int) -> str:
    """按重命名规则生成完整目标路径；index 从 0 开始。"""
    stem = source_path.stem
    extension = source_path.suffix
    rename_mode = payload.get("renameMode")

    if rename_mode == "prefix":
        target_name = f"{payload.get('prefix', '')}{stem}{extension}"
    elif rename_mode == "suffix":
        target_name = f"{stem}{payload.get('suffix', '')}{extension}"
    elif rename_mode == "replace":
        search = payload.get("search", "")
        if not isinstance(search, str) or not search:
            raise ValueError("查找替换模式需要填写查找内容")
        target_name = f"{stem.replace(search, str(payload.get('replaceWith', '')))}{extension}"
    elif rename_mode == "sequence":
        sequence_start = int(payload.get("sequenceStart", 1))
        sequence_padding = int(payload.get("sequencePadding", 3))
        target_name = f"{payload.get('prefix', '')}{sequence_start + index:0{sequence_padding}d}{extension}"
    else:
        raise ValueError(f"不支持的重命名方式：{rename_mode}")

    if not target_name or target_name in {".", ".."} or Path(target_name).name != target_name:
        raise ValueError(f"生成的目标文件名不合法：{target_name}")

    return str(source_path.with_name(target_name))


def build_rename_items(payload: dict[str, Any]) -> list[dict[str, str]]:
    target_directory = payload.get("targetDirectory")
    if not isinstance(target_directory, str) or not target_directory.strip():
        raise ValueError("缺少目标文件夹")

    directory = Path(target_directory)
    if not directory.is_dir():
        raise ValueError(f"目标文件夹不存在：{directory}")

    files = sorted(
        (path for path in directory.iterdir() if path.is_file()),
        key=lambda path: path.name.casefold(),
    )
    items = []
    for index, path in enumerate(files):
        target_path = set_target_directory(path, payload, index)
        items.append(
            {
                "sourcePath": str(path),
                "sourceName": path.name,
                "targetPath": target_path,
                "targetName": Path(target_path).name,
            }
        )

    return items


def preview(payload: dict[str, Any]) -> dict[str, Any]:

    """扫描目标目录，并返回用于前端联调的模拟重命名预览。"""
    items = build_rename_items(payload)
    for item in items:
        item["status"] = "ready"

    return {
        "conflict": 0,
        "invalid": 0,
        "items": items,
        "ready": len(items),
        "total": len(items),
        "unchanged": 0,
    }


def execute(payload: dict[str, Any]) -> dict[str, Any]:
    """执行批量重命名；先改为临时名，避免名称交换或覆盖。"""
    items = build_rename_items(payload)
    operations = [
        (Path(item["sourcePath"]), Path(item["targetPath"]))
        for item in items
        if item["sourcePath"] != item["targetPath"]
    ]

    source_keys = {str(source).casefold() for source, _ in operations}
    target_keys: set[str] = set()
    for _, target in operations:
        target_key = str(target).casefold()
        if target_key in target_keys:
            raise ValueError(f"存在重复的目标文件名：{target.name}")
        target_keys.add(target_key)

        if target.exists() and target_key not in source_keys:
            raise ValueError(f"目标文件已存在，不能覆盖：{target}")

    token = uuid.uuid4().hex
    staged: list[tuple[Path, Path, Path]] = []
    completed: list[tuple[Path, Path, Path]] = []
    try:
        for index, (source, target) in enumerate(operations):
            temporary = source.with_name(f".{source.name}.astral-express-{token}-{index}.tmp")
            if temporary.exists():
                raise ValueError(f"临时文件已存在，无法安全重命名：{temporary}")
            source.rename(temporary)
            staged.append((source, temporary, target))

        for source, temporary, target in staged:
            temporary.rename(target)
            completed.append((source, temporary, target))
            report_progress(len(completed), len(operations))
    except (OSError, ValueError) as error:
        rollback_errors = []
        for source, _, target in reversed(completed):
            try:
                if target.exists():
                    target.rename(source)
            except OSError as rollback_error:
                rollback_errors.append(str(rollback_error))
        for source, temporary, _ in reversed(staged[len(completed) :]):
            try:
                if temporary.exists():
                    temporary.rename(source)
            except OSError as rollback_error:
                rollback_errors.append(str(rollback_error))

        detail = f"批量重命名失败：{error}"
        if rollback_errors:
            detail += f"；回滚时也发生错误：{'；'.join(rollback_errors)}"
        raise ValueError(detail) from error

    return {
        "renamed": len(operations),
        "unchanged": len(items) - len(operations),
        "total": len(items),
        "items": [
            {
                **item,
                "status": "renamed" if item["sourcePath"] != item["targetPath"] else "unchanged",
            }
            for item in items
        ],
    }


def main() -> None:
    request = json.load(sys.stdin)
    method = request.get("method")
    payload = request.get("payload")

    if not isinstance(payload, dict):
        raise ValueError("payload 必须是对象")
    if method == "preview":
        data = preview(payload)
    elif method == "execute":
        data = execute(payload)
    else:
        raise ValueError(f"不支持的方法：{method}")
    print(
        json.dumps(
            {"type": "success", "payload": {"message": f"{method} 执行完成", "data": data}}, ensure_ascii=False
        )
    )




if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from error
