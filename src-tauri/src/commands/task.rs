use std::sync::Arc;

use tauri::State;

use crate::database::state::DbState;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;
use crate::domain::task::Task;
use crate::task::repository;

#[tauri::command]
pub fn list_tasks(db: State<'_, Arc<DbState>>, module_id: ModuleId) -> ApiResponse<Vec<Task>> {
    ApiResponse::from(db.with_conn(|conn| repository::list(conn, module_id)))
}
