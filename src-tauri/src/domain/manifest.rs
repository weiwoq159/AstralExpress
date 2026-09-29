use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "manifest.ts")]
pub enum ManifestStatus {
    Available,
    Disabled,
    Unavailable,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifest.ts")]
pub struct Manifest {
    pub key: String,
    pub order: u32,
    pub name: String,
    pub category: String,
    pub description: String,
    pub tags: Vec<String>,
    pub icon: String,
    pub status: ManifestStatus,
    pub entry: String,
    pub is_queue: bool,
}
