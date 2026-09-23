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

-- 每个 manifest 一份持久设置（cookie/代理/基础 URL 之类），跟单次任务的 params_json 分开：
-- 设置是配一次、反复复用；params_json 是每次建任务都要重新给的一次性参数。
CREATE TABLE IF NOT EXISTS manifest_configs (
    module_id TEXT NOT NULL,
    manifest_key TEXT NOT NULL,
    config_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (module_id, manifest_key)
);

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

-- 藏宝阁梦幻西游的召唤兽名称/id 参考数据（mhxy-cbg-pets 爬虫抓取）。pet_id 用网站上的真实
-- id 做主键——同一个召唤兽名字可能对应 1-2 个不同的 id，所以主键是 id 不是 name。
CREATE TABLE IF NOT EXISTS mhxy_cbg_pets (
    pet_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_mhxy_cbg_pets_name ON mhxy_cbg_pets (name);

-- 藏宝阁梦幻西游的门派参考数据（mhxy-cbg-schools 爬虫抓取）。school_id 用网站上的真实
-- id 做主键，一门派对应一个名字。
CREATE TABLE IF NOT EXISTS mhxy_cbg_schools (
    school_id INTEGER PRIMARY KEY,
    school_name TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_mhxy_cbg_schools_name ON mhxy_cbg_schools (school_name);