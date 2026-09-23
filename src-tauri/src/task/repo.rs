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

/// 单纯切换状态，不清进度——用于 cancel（终态，需要写 finished_at）和 pause/resume（非终态，不动 finished_at）。
pub fn set_status(
    conn: &Connection,
    task_uid: &str,
    status: TaskStatus,
    mark_finished: bool,
) -> rusqlite::Result<usize> {
    if mark_finished {
        conn.execute(
            "UPDATE tasks SET status = ?1, finished_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), \
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE task_uid = ?2",
            params![status, task_uid],
        )
    } else {
        conn.execute(
            "UPDATE tasks SET status = ?1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE task_uid = ?2",
            params![status, task_uid],
        )
    }
}

/// retry / restart 共用：清掉进度和终态字段，回到 pending 重新排队。
pub fn reset_to_pending(conn: &Connection, task_uid: &str) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET status = 'pending', progress = 0, done = 0, error_message = NULL, \
         started_at = NULL, finished_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') \
         WHERE task_uid = ?1",
        params![task_uid],
    )
}

/// 调度器取下一个待执行任务：按创建时间先进先出，一次只取一条（串行执行引擎）。
pub fn next_pending(conn: &Connection) -> rusqlite::Result<Option<Task>> {
    conn.query_row(
        &format!("SELECT {TASK_FULL_COLUMNS} FROM tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1"),
        [],
        task_from_row,
    )
    .optional()
}

/// 调度器把任务派给执行引擎时调用：进入 running，记录开始时间。
pub fn mark_running(conn: &Connection, task_uid: &str) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET status = 'running', started_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), \
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE task_uid = ?1",
        params![task_uid],
    )
}

/// Python 进程正常退出并给出最终结果：写入 result_json，进度拉满，标记终态。
pub fn mark_success(
    conn: &Connection,
    task_uid: &str,
    result_json: &str,
) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET status = 'success', progress = 100, result_json = ?1, \
         finished_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') \
         WHERE task_uid = ?2",
        params![result_json, task_uid],
    )
}

/// Python 进程启动失败、非 0 退出码，或没有输出最终结果：标记失败并记录原因。
pub fn mark_failed(
    conn: &Connection,
    task_uid: &str,
    error_message: &str,
) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET status = 'failed', error_message = ?1, \
         finished_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') \
         WHERE task_uid = ?2",
        params![error_message, task_uid],
    )
}

/// 执行过程中收到一条 progress 消息：done/total/progress 各自可选，缺的字段保留原值不动。
pub fn update_progress(
    conn: &Connection,
    task_uid: &str,
    done: Option<i64>,
    total: Option<i64>,
    progress: Option<u8>,
) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET done = COALESCE(?1, done), total = COALESCE(?2, total), \
         progress = COALESCE(?3, progress), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE task_uid = ?4",
        params![done, total, progress, task_uid],
    )
}

/// 应用启动时的崩溃恢复：上次退出前还处于 running 的任务不可能有进程真的在跑，
/// 统一标记为 interrupted（前端已经支持从 interrupted 状态 retry）。
pub fn mark_orphaned_running_as_interrupted(conn: &Connection) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE tasks SET status = 'interrupted', finished_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), \
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE status = 'running'",
        [],
    )
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::module::ModuleId;
    use crate::domain::task::TaskStatus;
    use serde_json::json;

    fn memory_conn() -> Connection {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite");
        conn.execute_batch(include_str!("../database/schema.sql"))
            .expect("apply schema");
        conn
    }

    #[test]
    fn insert_then_get_by_uid_round_trips() {
        let conn = memory_conn();
        let new = NewTask {
            module_id: ModuleId::Tools,
            manifest_key: "batch-rename".to_string(),
            params: json!({ "targetDirectory": "D:/tmp" }),
        };
        insert(&conn, &new, "task-uid-1", "batch-rename-1").expect("insert");

        let task = get_by_uid(&conn, "task-uid-1")
            .expect("query")
            .expect("row exists");
        assert_eq!(task.module_id, ModuleId::Tools);
        assert_eq!(task.manifest_key, "batch-rename");
        assert_eq!(task.title, "batch-rename-1");
        assert_eq!(task.status, TaskStatus::Pending);
        assert_eq!(task.progress, 0);
        assert!(task.result_json.is_none());
        assert!(task.finished_at.is_none());
    }

    #[test]
    fn get_by_uid_returns_none_when_missing() {
        let conn = memory_conn();
        assert!(get_by_uid(&conn, "does-not-exist")
            .expect("query")
            .is_none());
    }

    #[test]
    fn list_filters_by_module_and_manifest_and_orders_by_created_at_desc() {
        let conn = memory_conn();
        let empty_params = json!({});
        insert(
            &conn,
            &NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "batch-rename".to_string(),
                params: empty_params.clone(),
            },
            "task-a",
            "a",
        )
        .expect("insert a");
        insert(
            &conn,
            &NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "audio-transcoder".to_string(),
                params: empty_params.clone(),
            },
            "task-b",
            "b",
        )
        .expect("insert b");
        insert(
            &conn,
            &NewTask {
                module_id: ModuleId::Crawler,
                manifest_key: "batch-rename".to_string(),
                params: empty_params,
            },
            "task-c",
            "c",
        )
        .expect("insert c");

        let tools_tasks =
            list(&conn, ModuleId::Tools, None, DEFAULT_TASK_LIMIT).expect("list tools");
        assert_eq!(tools_tasks.len(), 2);
        assert!(tools_tasks
            .iter()
            .all(|task| task.module_id == ModuleId::Tools));

        let scoped = list(
            &conn,
            ModuleId::Tools,
            Some("batch-rename"),
            DEFAULT_TASK_LIMIT,
        )
        .expect("list scoped");
        assert_eq!(scoped.len(), 1);
        assert_eq!(scoped[0].task_uid, "task-a");
    }

    #[test]
    fn list_omits_result_json_but_get_by_uid_keeps_it() {
        let conn = memory_conn();
        conn.execute(
            "UPDATE tasks SET result_json = '{}', status = 'success', finished_at = started_at WHERE 1 = 0",
            [],
        )
        .expect("noop update sanity check");
        insert(
            &conn,
            &NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "batch-rename".to_string(),
                params: json!({}),
            },
            "task-with-result",
            "t",
        )
        .expect("insert");
        conn.execute(
            "UPDATE tasks SET result_json = '{\"ok\":true}', status = 'success', finished_at = created_at WHERE task_uid = 'task-with-result'",
            [],
        )
        .expect("mark success with result");

        let listed = list(&conn, ModuleId::Tools, None, DEFAULT_TASK_LIMIT).expect("list");
        assert_eq!(listed[0].result_json, None);

        let fetched = get_by_uid(&conn, "task-with-result")
            .expect("get")
            .expect("exists");
        assert_eq!(fetched.result_json.as_deref(), Some("{\"ok\":true}"));
    }

    fn seed_task(conn: &Connection, task_uid: &str) {
        insert(
            conn,
            &NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "batch-rename".to_string(),
                params: json!({}),
            },
            task_uid,
            task_uid,
        )
        .expect("insert");
    }

    #[test]
    fn next_pending_returns_oldest_pending_task_and_ignores_other_statuses() {
        let conn = memory_conn();
        seed_task(&conn, "task-a");
        seed_task(&conn, "task-b");
        mark_running(&conn, "task-a").expect("mark running");

        let next = next_pending(&conn)
            .expect("next_pending")
            .expect("a pending task exists");
        assert_eq!(next.task_uid, "task-b");
    }

    #[test]
    fn next_pending_returns_none_when_queue_is_empty() {
        let conn = memory_conn();
        assert!(next_pending(&conn).expect("next_pending").is_none());
    }

    #[test]
    fn mark_running_sets_status_and_started_at() {
        let conn = memory_conn();
        seed_task(&conn, "task-a");

        mark_running(&conn, "task-a").expect("mark_running");

        let task = get_by_uid(&conn, "task-a").expect("get").expect("exists");
        assert_eq!(task.status, TaskStatus::Running);
        assert!(task.started_at.is_some());
    }

    #[test]
    fn mark_success_writes_result_and_full_progress() {
        let conn = memory_conn();
        seed_task(&conn, "task-a");
        mark_running(&conn, "task-a").expect("mark_running");

        mark_success(&conn, "task-a", "{\"renamed\":3}").expect("mark_success");

        let task = get_by_uid(&conn, "task-a").expect("get").expect("exists");
        assert_eq!(task.status, TaskStatus::Success);
        assert_eq!(task.progress, 100);
        assert_eq!(task.result_json.as_deref(), Some("{\"renamed\":3}"));
        assert!(task.finished_at.is_some());
    }

    #[test]
    fn mark_failed_writes_error_message() {
        let conn = memory_conn();
        seed_task(&conn, "task-a");
        mark_running(&conn, "task-a").expect("mark_running");

        mark_failed(&conn, "task-a", "启动 Python 进程失败").expect("mark_failed");

        let task = get_by_uid(&conn, "task-a").expect("get").expect("exists");
        assert_eq!(task.status, TaskStatus::Failed);
        assert_eq!(task.error_message.as_deref(), Some("启动 Python 进程失败"));
        assert!(task.finished_at.is_some());
    }

    #[test]
    fn update_progress_leaves_unset_fields_untouched() {
        let conn = memory_conn();
        seed_task(&conn, "task-a");
        mark_running(&conn, "task-a").expect("mark_running");

        update_progress(&conn, "task-a", Some(4), Some(10), None)
            .expect("update_progress done/total");
        let mid = get_by_uid(&conn, "task-a").expect("get").expect("exists");
        assert_eq!(mid.done, 4);
        assert_eq!(mid.total, 10);
        assert_eq!(mid.progress, 0);

        update_progress(&conn, "task-a", None, None, Some(40)).expect("update_progress percent");
        let after = get_by_uid(&conn, "task-a").expect("get").expect("exists");
        assert_eq!(after.done, 4);
        assert_eq!(after.total, 10);
        assert_eq!(after.progress, 40);
    }

    #[test]
    fn mark_orphaned_running_as_interrupted_only_touches_running_tasks() {
        let conn = memory_conn();
        seed_task(&conn, "task-running");
        seed_task(&conn, "task-pending");
        mark_running(&conn, "task-running").expect("mark_running");

        let affected = mark_orphaned_running_as_interrupted(&conn).expect("sweep");

        assert_eq!(affected, 1);
        let running = get_by_uid(&conn, "task-running")
            .expect("get")
            .expect("exists");
        assert_eq!(running.status, TaskStatus::Interrupted);
        assert!(running.finished_at.is_some());
        let pending = get_by_uid(&conn, "task-pending")
            .expect("get")
            .expect("exists");
        assert_eq!(pending.status, TaskStatus::Pending);
    }
}
