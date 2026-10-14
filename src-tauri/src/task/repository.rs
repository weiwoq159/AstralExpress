use rusqlite::{Connection, params};

use crate::domain::module::ModuleId;
use crate::domain::task::Task;

/// 按创建时间倒序列出某个模块的任务。
pub fn list(conn: &Connection, module_id: ModuleId) -> rusqlite::Result<Vec<Task>> {
    let mut stmt = conn.prepare(
        "SELECT task_uid, module_id, manifest_key, title, status, progress, total, done,
                error_message, created_at, started_at, finished_at
         FROM tasks
         WHERE module_id = ?1
         ORDER BY created_at DESC, id DESC",
    )?;
    stmt.query_map(params![module_id], |row| {
        Ok(Task {
            task_uid: row.get(0)?,
            module_id: row.get(1)?,
            manifest_key: row.get(2)?,
            title: row.get(3)?,
            status: row.get(4)?,
            progress: row.get(5)?,
            total: row.get(6)?,
            done: row.get(7)?,
            error_message: row.get(8)?,
            created_at: row.get(9)?,
            started_at: row.get(10)?,
            finished_at: row.get(11)?,
        })
    })?
    .collect()
}
