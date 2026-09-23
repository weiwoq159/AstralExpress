pub mod manifest_scanner;

use crate::domain::error::ManifestError;
use crate::domain::manifest::Manifest;
use crate::domain::module::ModuleId;

pub fn find(module_id: ModuleId, manifest_key: &str) -> Result<Option<Manifest>, ManifestError> {
    let manifests = manifest_scanner::manifests(module_id)?;
    Ok(manifests
        .into_iter()
        .find(|manifest| manifest.key == manifest_key))
}

pub fn contains(module_id: ModuleId, manifest_key: &str) -> Result<bool, ManifestError> {
    Ok(find(module_id, manifest_key)?.is_some())
}
