use std::fs;
use std::path::Path;

use crate::domain::response::ApiResponse;

/// 列出文件夹第一层的文件名（不含子文件夹），按名称排序。
fn list_files(dir: &str) -> Result<Vec<String>, String> {
    let entries = fs::read_dir(Path::new(dir)).map_err(|error| format!("无法读取文件夹：{error}"))?;
    let mut names = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|error| format!("读取文件夹条目失败：{error}"))?;
        let is_file = entry.file_type().map_err(|error| error.to_string())?.is_file();
        if is_file {
            names.push(entry.file_name().to_string_lossy().into_owned());
        }
    }
    names.sort();
    Ok(names)
}

#[tauri::command]
pub fn list_directory_files(path: String) -> ApiResponse<Vec<String>> {
    ApiResponse::from(list_files(&path))
}
