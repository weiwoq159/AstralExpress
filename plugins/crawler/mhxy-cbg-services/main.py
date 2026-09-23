"""梦幻西游藏宝阁大区列表爬虫。

抓取步骤与 cbg-spider 相同：打开藏宝阁首页，读出大区，再逐个点开读取该大区下的服务器。
stdout 只输出执行器协议行。`process` 更新进度，`db_insert` 逐行写入大区/服务器表，
最后一条 `success` 或 `failed` 才是终态，由 run::executor 决定任务成功还是失败。
日志写到 stderr。
"""

import json
import sys
from typing import Any, NoReturn

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def _force_utf8_stdio() -> None:
    """Windows 上管道 stdout 默认是系统 ANSI 代码页。执行器按 UTF-8 读，中文 JSON 会报 stream did not contain valid UTF-8。"""
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            reconfigure(encoding="utf-8")


_force_utf8_stdio()

MANIFEST_KEY = "mhxy-cbg-services"
HOME_URL = "https://xyq.cbg.163.com/"
WAIT_SECONDS = 10
# 大区表面板和服务器表面板是两张表。服务器表同时带 serverArea，链接上也会写 data_areaid。
AREA_LINK = "#area_list_panel a[data_areaid]"
SERVER_LINK = "#server_list_panel a[data_serverid]"


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


def insert_area(area_id: int, name: str) -> None:
    emit(
        "db_insert",
        {"tableName": "mhxy_cbg_areas", "value": {"area_id": area_id, "name": name}},
    )


def insert_server(server_id: int, area_id: int, name: str) -> None:
    emit(
        "db_insert",
        {
            "tableName": "mhxy_cbg_servers",
            "value": {"server_id": server_id, "area_id": area_id, "name": name},
        },
    )


def parse_int_attr(anchor: Any, attr: str) -> int:
    raw = anchor.get(attr)
    if not isinstance(raw, str) or not raw.isdigit():
        raise ValueError(f"链接缺少有效的 {attr}：{raw}")
    return int(raw)


def parse_areas(html: str) -> list[dict[str, Any]]:
    """只读大区面板。把服务器链接也当成大区的话，重复的 area_id 会覆盖 mhxy_cbg_areas 里的真实行。"""
    soup = BeautifulSoup(html, "lxml")
    areas: list[dict[str, Any]] = []
    seen: set[int] = set()
    for anchor in soup.select(AREA_LINK):
        if anchor.has_attr("data_serverid"):
            continue
        area_id = parse_int_attr(anchor, "data_areaid")
        name = anchor.get_text(strip=True)
        if not name or area_id in seen:
            continue
        seen.add(area_id)
        areas.append({"name": name, "area_id": area_id})
    return areas


def parse_servers(html: str, area_id: int) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    servers: list[dict[str, Any]] = []
    for anchor in soup.select(SERVER_LINK):
        if parse_int_attr(anchor, "data_areaid") != area_id:
            continue
        name = anchor.get_text(strip=True)
        if not name:
            continue
        servers.append({"name": name, "server_id": parse_int_attr(anchor, "data_serverid")})
    return servers


def servers_of(area_id: int):
    """点开大区后，上一区的服务器节点可能还在。等到面板里的 data_areaid 都换成当前大区再解析。"""

    def ready(driver: Any) -> bool:
        elements = driver.find_elements(By.CSS_SELECTOR, SERVER_LINK)
        if not elements:
            return False
        return all(element.get_attribute("data_areaid") == str(area_id) for element in elements)

    return ready


def crawl() -> list[dict[str, Any]]:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1400,900")

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    wait = WebDriverWait(driver, WAIT_SECONDS)
    try:
        driver.get(HOME_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, AREA_LINK)))
        pending = parse_areas(driver.page_source)
        if not pending:
            raise ValueError("未解析到大区列表")

        report_progress(0, len(pending))
        areas: list[dict[str, Any]] = []
        for index, area in enumerate(pending):
            area_id = int(area["area_id"])
            name = str(area["name"])
            area_element = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f'#area_list_panel a[data_areaid="{area_id}"]'))
            )
            area_element.click()
            try:
                wait.until(servers_of(area_id))
            except TimeoutException as error:
                raise ValueError(f"打开大区「{name}」后没有等到服务器列表") from error

            children = parse_servers(driver.page_source, area_id)
            if not children:
                raise ValueError(f"大区「{name}」下没有解析到服务器")

            insert_area(area_id, name)
            for server in children:
                insert_server(int(server["server_id"]), area_id, str(server["name"]))

            areas.append({"name": name, "area_id": area_id, "children": children})
            report_progress(index + 1, len(pending))
        return areas
    finally:
        try:
            driver.quit()
        except WebDriverException as error:
            print(f"关闭浏览器失败：{error}", file=sys.stderr)


def main() -> None:
    try:
        request = json.load(sys.stdin)
    except json.JSONDecodeError as error:
        fail(f"无法读取任务参数：{error}")

    if not isinstance(request, dict):
        fail("任务参数必须是 JSON 对象")

    if request.get("method") != "execute":
        fail(f"不支持的方法：{request.get('method')}")

    areas = crawl()
    server_count = sum(len(area["children"]) for area in areas)
    emit(
        "success",
        {
            "message": f"已获取 {len(areas)} 个大区、{server_count} 个服务器",
            "data": {"area_count": len(areas), "server_count": server_count, "areas": areas},
        },
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except WebDriverException as error:
        print(str(error), file=sys.stderr)
        fail("浏览器抓取失败")
    except Exception as error:
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        fail(str(error) or "抓取大区列表失败")
