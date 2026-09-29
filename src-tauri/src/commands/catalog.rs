use crate::catalog::manifest_scanner;
use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;

#[tauri::command]
pub fn get_manifests(module_id: ModuleId) -> ApiResponse<Vec<Manifest>> {
    ApiResponse::from(manifest_scanner::scan(module_id))
}
