CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_uid TEXT NOT NULL UNIQUE,
    module_id TEXT NOT NULL,
    manifest_key TEXT NOT NULL,
    title TEXT NOT NULL,
    params_json TEXT NOT NULL,
    result_json TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'paused', 'success', 'failed', 'canceled', 'interrupted')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    total INTEGER NOT NULL DEFAULT 0,
    done INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    started_at TEXT,
    finished_at TEXT,
    -- 终态必须有 finished_at，跟 TaskStatus::is_terminal 的语义保持一致
    CHECK (status NOT IN ('success', 'failed', 'canceled', 'interrupted') OR finished_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_tasks_module_manifest ON tasks (module_id, manifest_key);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);

-- 藏宝阁梦幻西游的大区/服务器参考数据（mhxy-cbg-services 爬虫抓取）。area_id/server_id 直接用
-- 网站上的真实 id 做主键：爬虫脚本边抓边通过 "db" 类型的执行消息逐行 insert or replace，
-- 不是抓完整批再一次性重建整张表（网站下架的大区/服务器不会自动从表里清掉，暂不处理）。
CREATE TABLE IF NOT EXISTS mhxy_cbg_areas (
    area_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS mhxy_cbg_servers (
    server_id INTEGER PRIMARY KEY,
    area_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_mhxy_cbg_servers_area_id ON mhxy_cbg_servers (area_id);

-- 调用记录：用户每点一次"运行"写一条，即时应用和入队应用都写，写入后不再更新。
-- 即时应用 task_uid 为空；队列应用填 tasks.task_uid，统计成功率时 LEFT JOIN tasks，
-- 不建外键——任务被删后记录要保留，用于调用次数统计。
CREATE TABLE IF NOT EXISTS invocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    manifest_key TEXT NOT NULL,
    task_uid TEXT,
    params_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_invocations_module_manifest ON invocations (module_id, manifest_key);
CREATE INDEX IF NOT EXISTS idx_invocations_task_uid ON invocations (task_uid);
