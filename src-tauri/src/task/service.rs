use crate::catalog::service::contains;
use crate::database::state::DbState;
use crate::domain::module::ModuleId;
use crate::domain::task::{NewTask, Task, TaskActionKind, TaskStatus};
use crate::task::repo;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

pub fn create(db: &DbState, new: NewTask) -> Result<String, String> {
    let exists = contains(new.module_id, &new.manifest_key)?;
    if !exists {
        return Err(format!("未知的插件: {}", new.manifest_key));
    }

    let task_uid = Uuid::new_v4().to_string();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let title = format!("{}-{timestamp}", new.manifest_key);

    db.with_conn(|conn| repo::insert(conn, &new, &task_uid, &title))
        .map_err(|error| error.to_string())?;

    Ok(task_uid)
}

pub fn list(
    db: &DbState,
    module_id: ModuleId,
    manifest_key: Option<&str>,
) -> Result<Vec<Task>, String> {
    db.with_conn(|conn| repo::list(conn, module_id, manifest_key, repo::DEFAULT_TASK_LIMIT))
        .map_err(|error| error.to_string())
}

pub fn get(db: &DbState, task_uid: &str) -> Result<Option<Task>, String> {
    db.with_conn(|conn| repo::get_by_uid(conn, task_uid))
        .map_err(|error| error.to_string())
}

// 这里只处理尚未执行的队列记录；运行中的进程必须由执行引擎控制。
fn queue_transition(status: TaskStatus, action: TaskActionKind) -> Option<(TaskStatus, bool)> {
    use TaskActionKind as Action;
    use TaskStatus as Status;
    match (status, action) {
        (Status::Pending | Status::Paused, Action::Cancel) => Some((Status::Canceled, false)),
        (Status::Pending, Action::Pause) => Some((Status::Paused, false)),
        (Status::Paused, Action::Resume) => Some((Status::Pending, false)),
        (Status::Paused, Action::Restart) => Some((Status::Pending, true)),
        (Status::Failed | Status::Canceled | Status::Interrupted, Action::Retry) => {
            Some((Status::Pending, true))
        }
        _ => None,
    }
}

pub fn apply_action(
    db: &DbState,
    module_id: ModuleId,
    task_uid: &str,
    action: TaskActionKind,
) -> Result<Task, String> {
    // 读取、校验、更新和回读持有同一把锁，并在同一个事务中完成。
    db.with_conn(|conn| {
        let transaction = conn.unchecked_transaction()?;
        let Some(task) = repo::get_by_uid(&transaction, task_uid)? else {
            return Ok(Err("任务不存在".to_string()));
        };
        if task.module_id != module_id {
            return Ok(Err("任务不属于当前模块".to_string()));
        }
        let Some((status, reset)) = queue_transition(task.status, action) else {
            return Ok(Err(format!(
                "当前任务状态 {} 不支持操作 {}",
                task.status.as_str(),
                action.as_str()
            )));
        };
        repo::update_queue_status(&transaction, task_uid, status, reset)?;
        let updated = repo::get_by_uid(&transaction, task_uid)?
            .ok_or(rusqlite::Error::QueryReturnedNoRows)?;
        transaction.commit()?;
        Ok(Ok(updated))
    })
    .map_err(|error| error.to_string())?
}
