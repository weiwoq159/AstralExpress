use crate::database::state::DbState;
use crate::domain::manifest_config::{ManifestConfig, SetManifestConfig};
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;
use crate::manifest_config::service;
use tauri::State;

#[tauri::command(async)]
pub fn get_manifest_config(
    state: State<'_, DbState>,
    module_id: ModuleId,
    manifest_key: String,
) -> ApiResponse<Option<ManifestConfig>> {
    ApiResponse::from_result(service::get(&state, module_id, &manifest_key))
}

#[tauri::command(async)]
pub fn set_manifest_config(
    state: State<'_, DbState>,
    config: SetManifestConfig,
) -> ApiResponse<ManifestConfig> {
    ApiResponse::from_result(service::set(&state, config))
}
