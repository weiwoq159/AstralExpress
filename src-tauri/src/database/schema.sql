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