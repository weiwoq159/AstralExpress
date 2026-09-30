use crate::domain::module::ModuleId;
use crate::domain::task::{NewTask, Task, TaskStatus};
use rusqlite::{params, Connection, OptionalExtension, Row};

pub const DEFAULT_TASK_LIMIT: u32 = 100;

// 列表查询用 NULL 顶替 result_json：队列视图不需要把可能很大的结果 JSON 一起传下去。
const TASK_LIST_COLUMNS: &str = "id, task_uid, module_id, manifest_key, title, params_json, NULL AS result_json, status, progress, total, done, error_message, created_at, updated_at, started_at, finished_at";
const TASK_FULL_COLUMNS: &str = "id, task_uid, module_id, manifest_key, title, params_json, result_json, status, progress, total, done, error_message, created_at, updated_at, started_at, finished_at";

pub fn insert(
    conn: &Connection,
    new: &NewTask,
    task_uid: &str,
    title: &str,
) -> rusqlite::Result<i64> {
    conn.execute(
        "INSERT INTO tasks (task_uid, module_id, manifest_key, title, params_json) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![task_uid, new.module_id, new.manifest_key, title, new.params.to_string()],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn get_by_uid(conn: &Connection, task_uid: &str) -> rusqlite::Result<Option<Task>> {
    conn.query_row(
        &format!("SELECT {TASK_FULL_COLUMNS} FROM tasks WHERE task_uid = ?1"),
        [task_uid],
        task_from_row,
    )
    .optional()
}

pub fn update_queue_status(
    conn: &Connection,
    task_uid: &str,
    status: TaskStatus,
    reset: bool,
) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE tasks SET
            status = ?2,
            progress = CASE WHEN ?3 THEN 0 ELSE progress END,
            total = CASE WHEN ?3 THEN 0 ELSE total END,
            done = CASE WHEN ?3 THEN 0 ELSE done END,
            result_json = CASE WHEN ?3 THEN NULL ELSE result_json END,
            error_message = CASE WHEN ?3 THEN NULL ELSE error_message END,
            started_at = CASE WHEN ?3 THEN NULL ELSE started_at END,
            finished_at = CASE
                WHEN ?2 = 'canceled' THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHEN ?3 THEN NULL ELSE finished_at END,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE task_uid = ?1",
        params![task_uid, status, reset],
    )?;
    Ok(())
}

pub fn list(
    conn: &Connection,
    module_id: ModuleId,
    manifest_key: Option<&str>,
    limit: u32,
) -> rusqlite::Result<Vec<Task>> {
    let mut stmt = conn.prepare(&format!(
        "SELECT {TASK_LIST_COLUMNS} FROM tasks WHERE module_id = ?1 AND (?2 IS NULL OR manifest_key = ?2) ORDER BY created_at DESC LIMIT ?3"
    ))?;
    let rows = stmt.query_map(params![module_id, manifest_key, limit], task_from_row)?;
    rows.collect()
}

fn task_from_row(row: &Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get("id")?,
        task_uid: row.get("task_uid")?,
        module_id: row.get("module_id")?,
        manifest_key: row.get("manifest_key")?,
        title: row.get("title")?,
        params_json: row.get("params_json")?,
        result_json: row.get("result_json")?,
        status: row.get("status")?,
        progress: row.get("progress")?,
        total: row.get("total")?,
        done: row.get("done")?,
        error_message: row.get("error_message")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        started_at: row.get("started_at")?,
        finished_at: row.get("finished_at")?,
    })
}
