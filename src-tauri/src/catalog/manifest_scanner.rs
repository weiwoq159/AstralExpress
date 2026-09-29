use std::{fs, io::ErrorKind};

use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;
use crate::platform::paths;

/// 扫描模块直属子目录中的清单，按 `order` 升序返回。
/// 模块目录不存在时返回空列表；单个插件读取或解析失败时记录警告并跳过。
pub fn scan(module_id: ModuleId) -> Result<Vec<Manifest>, String> {
    let dir = paths::plugin_dir(module_id)?;
    let entries = match fs::read_dir(&dir) {
        Ok(entries) => entries,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(Vec::new()),
        Err(error) => return Err(format!("读取插件目录 {} 失败: {error}", dir.display())),
    };

    let mut manifests = Vec::new();
    for entry in entries {
        let entry = match entry {
            Ok(entry) => entry,
            Err(error) => {
                log::warn!("读取 {} 下的目录项失败: {error}", dir.display());
                continue;
            }
        };

        match read_plugin_manifest(&entry) {
            Ok(Some(manifest)) => manifests.push(manifest),
            Ok(None) => {}
            Err(error) => log::warn!("{error}"),
        }
    }

    manifests.sort_by_key(|manifest| manifest.order);
    Ok(manifests)
}

/// 非目录或没有清单的目录不是插件条目，用 `None` 表示正常跳过。
fn read_plugin_manifest(entry: &fs::DirEntry) -> Result<Option<Manifest>, String> {
    let path = entry.path();
    let file_type = entry
        .file_type()
        .map_err(|error| format!("读取 {} 的文件类型失败: {error}", path.display()))?;
    if !file_type.is_dir() {
        return Ok(None);
    }

    let manifest_path = path.join("manifest.json");
    let metadata = match fs::metadata(&manifest_path) {
        Ok(metadata) => metadata,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(None),
        Err(error) => {
            return Err(format!(
                "读取 {} 的文件信息失败: {error}",
                manifest_path.display()
            ));
        }
    };
    if !metadata.is_file() {
        return Ok(None);
    }

    let bytes = fs::read(&manifest_path)
        .map_err(|error| format!("读取 {} 失败: {error}", manifest_path.display()))?;
    // 部分编辑器保存 UTF-8 文件时会添加 BOM，解析 JSON 前需要移除。
    let body = bytes.strip_prefix(b"\xEF\xBB\xBF").unwrap_or(&bytes);
    let manifest = serde_json::from_slice(body)
        .map_err(|error| format!("解析 {} 失败: {error}", manifest_path.display()))?;

    Ok(Some(manifest))
}
