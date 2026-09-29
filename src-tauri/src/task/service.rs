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
