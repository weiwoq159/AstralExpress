use super::repo::{self, DEFAULT_TASK_LIMIT};
use crate::catalog;
use crate::database::state::DbState;
use crate::domain::error::TaskError;
use crate::domain::module::ModuleId;
use crate::domain::task::{NewTask, Task, TaskActionKind, TaskStatus};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

pub fn create(db: &DbState, new: NewTask) -> Result<String, TaskError> {
    let exists = catalog::contains(new.module_id, &new.manifest_key).map_err(|error| {
        TaskError::CatalogUnavailable {
            reason: error.to_string(),
        }
    })?;
    if !exists {
        return Err(TaskError::UnknownManifest {
            module_id: new.module_id,
            manifest_key: new.manifest_key.clone(),
        });
    }

    let task_uid = Uuid::new_v4().to_string();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let title = format!("{}-{timestamp}", new.manifest_key);

    db.with_conn(|conn| repo::insert(conn, &new, &task_uid, &title))
        .map_err(|error| TaskError::Database {
            action: "创建任务".to_string(),
            reason: error.to_string(),
        })?;

    Ok(task_uid)
}

pub fn list(
    db: &DbState,
    module_id: ModuleId,
    manifest_key: Option<&str>,
) -> Result<Vec<Task>, TaskError> {
    db.with_conn(|conn| repo::list(conn, module_id, manifest_key, DEFAULT_TASK_LIMIT))
        .map_err(|error| TaskError::Database {
            action: "读取任务列表".to_string(),
            reason: error.to_string(),
        })
}

pub fn get(db: &DbState, task_uid: &str) -> Result<Option<Task>, TaskError> {
    db.with_conn(|conn| repo::get_by_uid(conn, task_uid))
        .map_err(|error| TaskError::Database {
            action: "读取任务".to_string(),
            reason: error.to_string(),
        })
}

enum Transition {
    /// 切到一个终态，需要写 finished_at（目前只有 cancel 用得上）。
    Terminal(TaskStatus),
    /// 切到一个非终态，不动 finished_at（pause/resume）。
    Simple(TaskStatus),
    /// 清进度回到 pending 重新排队（retry/restart）。
    Reset,
}

/// 队列侧的状态操作，只改数据库记录。合法的 (当前状态, 操作) 组合要跟前端
/// `taskStatusPresentation` 里给每个状态配的按钮保持一致，两边对不上就是 bug。
fn plan_transition(status: TaskStatus, action: TaskActionKind) -> Option<Transition> {
    match (status, action) {
        (TaskStatus::Pending, TaskActionKind::Cancel) => {
            Some(Transition::Terminal(TaskStatus::Canceled))
        }
        (TaskStatus::Pending, TaskActionKind::Pause) => {
            Some(Transition::Simple(TaskStatus::Paused))
        }
        (TaskStatus::Paused, TaskActionKind::Resume) => {
            Some(Transition::Simple(TaskStatus::Pending))
        }
        (TaskStatus::Paused, TaskActionKind::Restart) => Some(Transition::Reset),
        (TaskStatus::Failed, TaskActionKind::Retry) => Some(Transition::Reset),
        (TaskStatus::Canceled, TaskActionKind::Retry) => Some(Transition::Reset),
        (TaskStatus::Interrupted, TaskActionKind::Retry) => Some(Transition::Reset),
        _ => None,
    }
}

pub fn apply_action(
    db: &DbState,
    task_uid: &str,
    action: TaskActionKind,
) -> Result<Task, TaskError> {
    let current = db
        .with_conn(|conn| repo::get_by_uid(conn, task_uid))
        .map_err(|error| TaskError::Database {
            action: "读取任务".to_string(),
            reason: error.to_string(),
        })?
        .ok_or_else(|| TaskError::NotFound {
            task_uid: task_uid.to_string(),
        })?;

    let transition =
        plan_transition(current.status, action).ok_or_else(|| TaskError::InvalidTransition {
            task_uid: task_uid.to_string(),
            status: current.status,
            action,
        })?;

    db.with_conn(|conn| match transition {
        Transition::Terminal(status) => repo::set_status(conn, task_uid, status, true),
        Transition::Simple(status) => repo::set_status(conn, task_uid, status, false),
        Transition::Reset => repo::reset_to_pending(conn, task_uid),
    })
    .map_err(|error| TaskError::Database {
        action: "更新任务状态".to_string(),
        reason: error.to_string(),
    })?;

    db.with_conn(|conn| repo::get_by_uid(conn, task_uid))
        .map_err(|error| TaskError::Database {
            action: "读取任务".to_string(),
            reason: error.to_string(),
        })?
        .ok_or_else(|| TaskError::NotFound {
            task_uid: task_uid.to_string(),
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn memory_db() -> DbState {
        DbState::new(":memory:").expect("open in-memory sqlite")
    }

    #[test]
    fn create_rejects_unknown_manifest_key() {
        let db = memory_db();
        let error = create(
            &db,
            NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "does-not-exist".to_string(),
                params: json!({}),
            },
        )
        .expect_err("should reject unknown manifest key");

        assert!(matches!(error, TaskError::UnknownManifest { .. }));
    }

    #[test]
    fn create_then_get_then_list_round_trips_against_real_catalog() {
        let db = memory_db();
        // batch-rename 是 plugins/tools/batch-rename/manifest.json 里真实存在的 key，
        // 跟 catalog::manifest_scanner 的测试用的是同一份数据。
        let task_uid = create(
            &db,
            NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "batch-rename".to_string(),
                params: json!({ "targetDirectory": "D:/tmp" }),
            },
        )
        .expect("create should succeed for a real manifest key");

        let fetched = get(&db, &task_uid)
            .expect("get should succeed")
            .expect("task should exist");
        assert_eq!(fetched.task_uid, task_uid);
        assert_eq!(fetched.manifest_key, "batch-rename");
        assert_eq!(
            fetched.params_json,
            json!({ "targetDirectory": "D:/tmp" }).to_string()
        );

        let listed = list(&db, ModuleId::Tools, None).expect("list should succeed");
        assert!(listed.iter().any(|task| task.task_uid == task_uid));

        let scoped_out =
            list(&db, ModuleId::Tools, Some("audio-transcoder")).expect("list should succeed");
        assert!(scoped_out.iter().all(|task| task.task_uid != task_uid));
    }

    fn create_test_task(db: &DbState) -> String {
        create(
            db,
            NewTask {
                module_id: ModuleId::Tools,
                manifest_key: "batch-rename".to_string(),
                params: json!({}),
            },
        )
        .expect("create should succeed")
    }

    #[test]
    fn cancel_moves_pending_to_canceled_and_sets_finished_at() {
        let db = memory_db();
        let task_uid = create_test_task(&db);

        let updated =
            apply_action(&db, &task_uid, TaskActionKind::Cancel).expect("cancel should succeed");

        assert_eq!(updated.status, TaskStatus::Canceled);
        assert!(updated.finished_at.is_some());
    }

    #[test]
    fn pause_then_resume_round_trips_through_paused() {
        let db = memory_db();
        let task_uid = create_test_task(&db);

        let paused =
            apply_action(&db, &task_uid, TaskActionKind::Pause).expect("pause should succeed");
        assert_eq!(paused.status, TaskStatus::Paused);

        let resumed =
            apply_action(&db, &task_uid, TaskActionKind::Resume).expect("resume should succeed");
        assert_eq!(resumed.status, TaskStatus::Pending);
    }

    #[test]
    fn restart_from_paused_clears_progress_and_error() {
        let db = memory_db();
        let task_uid = create_test_task(&db);
        db.with_conn(|conn| {
            conn.execute(
                "UPDATE tasks SET status = 'paused', progress = 40, done = 4, error_message = 'boom' WHERE task_uid = ?1",
                rusqlite::params![task_uid],
            )
        })
        .expect("seed paused state");

        let restarted =
            apply_action(&db, &task_uid, TaskActionKind::Restart).expect("restart should succeed");

        assert_eq!(restarted.status, TaskStatus::Pending);
        assert_eq!(restarted.progress, 0);
        assert_eq!(restarted.done, 0);
        assert!(restarted.error_message.is_none());
    }

    #[test]
    fn retry_from_failed_clears_error_and_finished_at() {
        let db = memory_db();
        let task_uid = create_test_task(&db);
        db.with_conn(|conn| {
            conn.execute(
                "UPDATE tasks SET status = 'failed', error_message = 'boom', finished_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE task_uid = ?1",
                rusqlite::params![task_uid],
            )
        })
        .expect("seed failed state");

        let retried =
            apply_action(&db, &task_uid, TaskActionKind::Retry).expect("retry should succeed");

        assert_eq!(retried.status, TaskStatus::Pending);
        assert!(retried.error_message.is_none());
        assert!(retried.finished_at.is_none());
    }

    #[test]
    fn rejects_invalid_transition() {
        let db = memory_db();
        let task_uid = create_test_task(&db);

        // 新建任务是 pending，pending 状态不允许 retry（只有终态/paused 才允许）。
        let error = apply_action(&db, &task_uid, TaskActionKind::Retry).expect_err("should reject");

        assert!(matches!(error, TaskError::InvalidTransition { .. }));
    }

    #[test]
    fn rejects_unknown_task_uid() {
        let db = memory_db();
        let error =
            apply_action(&db, "does-not-exist", TaskActionKind::Cancel).expect_err("should reject");

        assert!(matches!(error, TaskError::NotFound { .. }));
    }

    /// 手动往真实数据库（不是内存库）里灌几条示例任务，方便跑桌面客户端时任务队列页面有内容看。
    /// 不参与正常测试套件，需要显式指定才会运行：
    /// `cargo test --package app -- --ignored seed_dev_data --nocapture`
    #[test]
    #[ignore]
    fn seed_dev_data() {
        use rusqlite::params;

        let path = crate::platform::paths::database_path().expect("resolve database path");
        println!("seeding {}", path.display());
        let db = DbState::new(&path).expect("open real sqlite db");

        // (manifest_key, status, progress, total, done, error_message)
        let seeds: [(&str, &str, u8, i64, i64, Option<&str>); 5] = [
            ("audio-transcoder", "running", 62, 0, 0, None),
            ("batch-rename", "pending", 0, 0, 0, None),
            ("document-converter", "success", 100, 48, 48, None),
            (
                "duplicate-file-scanner",
                "failed",
                34,
                200,
                68,
                Some("目标目录不可读：权限不足"),
            ),
            ("file-organizer", "paused", 51, 160, 82, None),
        ];

        for (manifest_key, status, progress, total, done, error_message) in seeds {
            let task_uid = create(
                &db,
                NewTask {
                    module_id: ModuleId::Tools,
                    manifest_key: manifest_key.to_string(),
                    params: json!({}),
                },
            )
            .unwrap_or_else(|error| panic!("create {manifest_key} failed: {error}"));

            db.with_conn(|conn| {
                conn.execute(
                    "UPDATE tasks SET status = ?1, progress = ?2, total = ?3, done = ?4, error_message = ?5, \
                     started_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), \
                     finished_at = CASE WHEN ?1 IN ('success', 'failed', 'canceled', 'interrupted') \
                         THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ELSE NULL END \
                     WHERE task_uid = ?6",
                    params![status, progress, total, done, error_message, task_uid],
                )
            })
            .unwrap_or_else(|error| panic!("update {manifest_key} failed: {error}"));

            println!("seeded {manifest_key} -> {status} ({task_uid})");
        }
    }
}
