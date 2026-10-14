use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ValueRef};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::module::ModuleId;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "task.ts")]
pub enum TaskStatus {
    Pending,
    Running,
    Paused,
    Success,
    Failed,
    Canceled,
    Interrupted,
}

impl FromSql for TaskStatus {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        match value.as_str()? {
            "pending" => Ok(Self::Pending),
            "running" => Ok(Self::Running),
            "paused" => Ok(Self::Paused),
            "success" => Ok(Self::Success),
            "failed" => Ok(Self::Failed),
            "canceled" => Ok(Self::Canceled),
            "interrupted" => Ok(Self::Interrupted),
            _ => Err(FromSqlError::InvalidType),
        }
    }
}

/// 任务列表条目。不含 params_json / result_json，这两项只在任务详情里读取。
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "task.ts")]
pub struct Task {
    pub task_uid: String,
    pub module_id: ModuleId,
    pub manifest_key: String,
    pub title: String,
    pub status: TaskStatus,
    pub progress: u8,
    pub total: u32,
    pub done: u32,
    pub error_message: Option<String>,
    pub created_at: String,
    pub started_at: Option<String>,
    pub finished_at: Option<String>,
}
