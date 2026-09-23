use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "manifest.ts")]
pub enum ManifestStatus {
    Available,
    Disabled,
    Unavailable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "manifest.ts")]
pub enum ParamKind {
    String,
    Number,
    Bool,
    Enum,
    Path,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifest.ts")]
pub struct ParamOption {
    pub value: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifest.ts")]
pub struct ParamDescriptor {
    pub name: String,
    pub label: String,
    pub kind: ParamKind,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    #[ts(type = "unknown")]
    pub default: Option<Value>,
    #[serde(default)]
    pub options: Option<Vec<ParamOption>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "manifest.ts")]
pub struct MethodDescriptor {
    pub name: String,
    pub label: String,
    pub params: Vec<ParamDescriptor>,
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
    pub methods: Vec<MethodDescriptor>,
    #[serde(default = "empty_metadata")]
    #[ts(type = "Record<string, unknown>")]
    pub metadata: Value,
}

fn empty_metadata() -> Value {
    Value::Object(Default::default())
}
