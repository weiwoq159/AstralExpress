use crate::domain::error::ManifestError;
use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;
use crate::platform::paths;
use std::fs;

pub struct ScanOutcome {
    pub manifests: Vec<Manifest>,
    pub errors: Vec<ManifestError>,
}

pub fn scan(module_id: ModuleId) -> Result<ScanOutcome, ManifestError> {
    let dir = paths::plugin_dir(module_id)
        .map_err(|reason| ManifestError::DirectoryUnavailable { module_id, reason })?;
    let mut manifests = Vec::new();
    let mut errors = Vec::new();
    let entries = match fs::read_dir(&dir) {
        Ok(entries) => entries,
        // 目录不存在不算错误：模块目录本来就允许还没有任何插件条目
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(ScanOutcome { manifests, errors });
        }
        Err(error) => {
            return Err(ManifestError::DirectoryUnavailable {
                module_id,
                reason: error.to_string(),
            });
        }
    };
    for entry in entries {
        let entry = match entry {
            Ok(entry) => entry,
            Err(error) => {
                errors.push(ManifestError::ReadFailed {
                    path: dir.display().to_string(),
                    reason: error.to_string(),
                });
                continue;
            }
        };
        match entry.file_type() {
            Ok(file_type) if file_type.is_dir() => {}
            Ok(_) => continue,
            Err(error) => {
                errors.push(ManifestError::ReadFailed {
                    path: entry.path().display().to_string(),
                    reason: error.to_string(),
                });
                continue;
            }
        }
        let manifest_path = entry.path().join("manifest.json");
        if !manifest_path.is_file() {
            continue;
        }
        let bytes = match fs::read(&manifest_path) {
            Ok(bytes) => bytes,
            Err(error) => {
                errors.push(ManifestError::ReadFailed {
                    path: manifest_path.display().to_string(),
                    reason: error.to_string(),
                });
                continue;
            }
        };
        let body = bytes.strip_prefix(b"\xEF\xBB\xBF").unwrap_or(&bytes);
        match serde_json::from_slice::<Manifest>(body) {
            Ok(manifest) => manifests.push(manifest),
            Err(error) => errors.push(ManifestError::ParseFailed {
                path: manifest_path.display().to_string(),
                reason: error.to_string(),
            }),
        }
    }
    manifests.sort_by_key(|manifest| manifest.order);
    Ok(ScanOutcome { manifests, errors })
}

pub fn manifests(module_id: ModuleId) -> Result<Vec<Manifest>, ManifestError> {
    let outcome = scan(module_id)?;
    for error in &outcome.errors {
        log::warn!("跳过模块 {} 的一个插件条目：{error}", module_id.as_str());
    }
    Ok(outcome.manifests)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scans_real_tools_plugins() {
        let outcome = scan(ModuleId::Tools).expect("scan should succeed");
        assert!(
            outcome.errors.is_empty(),
            "unexpected errors: {:?}",
            outcome.errors
        );
        assert!(outcome
            .manifests
            .iter()
            .any(|manifest| manifest.key == "batch-rename"));
    }

    #[test]
    fn scans_real_crawler_plugins() {
        let outcome = scan(ModuleId::Crawler).expect("scan should succeed");
        assert!(
            outcome.errors.is_empty(),
            "unexpected errors: {:?}",
            outcome.errors
        );
        assert_eq!(outcome.manifests.len(), 6);
    }
}
