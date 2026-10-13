use std::{
    fs,
    io::ErrorKind,
    path::{Component, Path},
};

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
        let path = entry.path();
        let is_plugin_dir = match entry.file_type() {
            Ok(file_type) => file_type.is_dir(),
            Err(error) => {
                log::warn!("读取 {} 的文件类型失败: {error}", path.display());
                continue;
            }
        };
        if !is_plugin_dir {
            continue;
        }
        match read_manifest_file(&path.join("manifest.json")) {
            Ok(Some(manifest)) => manifests.push(manifest),
            Ok(None) => {}
            Err(error) => log::warn!("{error}"),
        }
    }
    manifests.sort_by_key(|manifest| manifest.order);
    Ok(manifests)
}

/// 按 key 直接定位单个插件目录读取清单，不扫描同级目录。
///
/// `manifest_key` 必须是单个合法目录名（不能包含路径分隔符、`..` 或盘符前缀），
/// 校验失败或清单不存在时返回 `Ok(None)`，避免把调用方传入的片段拼出插件目录之外的路径。
pub fn read(module_id: ModuleId, manifest_key: &str) -> Result<Option<Manifest>, String> {
    let mut components = Path::new(manifest_key).components();
    if !matches!(components.next(), Some(Component::Normal(_))) || components.next().is_some() {
        return Ok(None);
    }
    let manifest_path = paths::plugin_dir(module_id)?
        .join(manifest_key)
        .join("manifest.json");
    read_manifest_file(&manifest_path)
}

/// 读取并解析单个 manifest.json；文件不存在（或路径不是文件）时返回 `None`。
fn read_manifest_file(manifest_path: &Path) -> Result<Option<Manifest>, String> {
    let metadata = match fs::metadata(manifest_path) {
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
    let bytes = fs::read(manifest_path)
        .map_err(|error| format!("读取 {} 失败: {error}", manifest_path.display()))?;
    // 部分编辑器保存 UTF-8 文件时会添加 BOM，解析 JSON 前需要移除。
    let body = bytes.strip_prefix(b"\xEF\xBB\xBF").unwrap_or(&bytes);
    let manifest = serde_json::from_slice(body)
        .map_err(|error| format!("解析 {} 失败: {error}", manifest_path.display()))?;

    Ok(Some(manifest))
}
