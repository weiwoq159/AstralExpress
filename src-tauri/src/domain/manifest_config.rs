use crate::domain::module::ModuleId;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

/// 某个 manifest 的持久设置——配一次、反复跑任务都复用，跟单次任务的参数
/// （`domain::task::NewTask::params`）是两回事：那个每次建任务都要重新给。
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifestConfig.ts")]
pub struct ManifestConfig {
    pub module_id: ModuleId,
    pub manifest_key: String,
    #[ts(type = "Record<string, unknown>")]
    pub config: Value,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifestConfig.ts")]
pub struct SetManifestConfig {
    pub module_id: ModuleId,
    pub manifest_key: String,
    #[ts(type = "Record<string, unknown>")]
    pub config: Value,
}
