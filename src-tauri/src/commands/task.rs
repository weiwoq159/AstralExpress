use crate::database::state::DbState;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;
use crate::domain::task::{CreateTaskResult, NewTask, Task};
use crate::task::service;
use tauri::State;

#[tauri::command(async)]
pub fn create_task(state: State<'_, DbState>, task: NewTask) -> ApiResponse<CreateTaskResult> {
    ApiResponse::from(service::create(&state, task).map(|task_uid| CreateTaskResult { task_uid }))
}

#[tauri::command(async)]
pub fn get_task_by_uid(state: State<'_, DbState>, task_uid: String) -> ApiResponse<Option<Task>> {
    ApiResponse::from(service::get(&state, &task_uid))
}

#[tauri::command(async)]
pub fn list_tasks(
    state: State<'_, DbState>,
    module_id: ModuleId,
    manifest_key: Option<String>,
) -> ApiResponse<Vec<Task>> {
    ApiResponse::from(service::list(&state, module_id, manifest_key.as_deref()))
}
