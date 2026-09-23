use crate::catalog::manifest_scanner;
use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;

#[tauri::command(async)]
pub fn get_manifests(module_id: ModuleId) -> ApiResponse<Vec<Manifest>> {
    ApiResponse::from_result(manifest_scanner::manifests(module_id))
}
