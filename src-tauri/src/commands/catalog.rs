use crate::catalog::scanner;
use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;
use crate::domain::response::ApiResponse;

#[tauri::command]
pub fn list_manifests(module_id: ModuleId) -> ApiResponse<Vec<Manifest>> {
    ApiResponse::from(scanner::scan(module_id))
}

#[tauri::command]
pub fn read_manifest(module_id: ModuleId, manifest_key: String) -> ApiResponse<Manifest> {
    let result: Result<Manifest, String> = scanner::read(module_id, &manifest_key)
        .and_then(|manifest| manifest.ok_or_else(|| format!("未找到插件：{manifest_key}")));
    ApiResponse::from(result)
}
