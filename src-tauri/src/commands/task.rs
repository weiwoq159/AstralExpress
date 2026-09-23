use crate::database::state::DbState;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;
use crate::domain::task::{CreateTaskResult, NewTask, Task, TaskActionKind};
use crate::task::{events, service};
use tauri::{AppHandle, State};

#[tauri::command(async)]
pub fn create_task(
    app: AppHandle,
    state: State<'_, DbState>,
    task: NewTask,
) -> ApiResponse<CreateTaskResult> {
    let result = service::create(&state, task);
    if let Ok(task_uid) = &result {
        events::emit_task_changed(&app, task_uid);
    }
    ApiResponse::from_result(result.map(|task_uid| CreateTaskResult { task_uid }))
}

#[tauri::command(async)]
pub fn get_task_by_uid(state: State<'_, DbState>, task_uid: String) -> ApiResponse<Option<Task>> {
    ApiResponse::from_result(service::get(&state, &task_uid))
}

#[tauri::command(async)]
pub fn list_tasks(
    state: State<'_, DbState>,
    module_id: ModuleId,
    manifest_key: Option<String>,
) -> ApiResponse<Vec<Task>> {
    ApiResponse::from_result(service::list(&state, module_id, manifest_key.as_deref()))
}

#[tauri::command(async)]
pub fn update_task_status(
    app: AppHandle,
    state: State<'_, DbState>,
    task_uid: String,
    action: TaskActionKind,
) -> ApiResponse<Task> {
    let result = service::apply_action(&state, &task_uid, action);
    if result.is_ok() {
        events::emit_task_changed(&app, &task_uid);
    }
    ApiResponse::from_result(result)
}
