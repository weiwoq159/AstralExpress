use crate::domain::module::ModuleId;
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

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

impl TaskStatus {
    /// 与数据库 status 列的取值保持一致
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Running => "running",
            Self::Paused => "paused",
            Self::Success => "success",
            Self::Failed => "failed",
            Self::Canceled => "canceled",
            Self::Interrupted => "interrupted",
        }
    }
}

impl ToSql for TaskStatus {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(self.as_str()))
    }
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

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "task.ts")]
pub struct Task {
    #[ts(type = "number")]
    pub id: i64,
    pub task_uid: String,
    pub module_id: ModuleId,
    pub manifest_key: String,
    pub title: String,
    pub params_json: String,
    pub result_json: Option<String>,
    pub status: TaskStatus,
    pub progress: u8,
    #[ts(type = "number")]
    pub total: i64,
    #[ts(type = "number")]
    pub done: i64,
    pub error_message: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub started_at: Option<String>,
    pub finished_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "task.ts")]
pub struct NewTask {
    pub module_id: ModuleId,
    pub manifest_key: String,
    #[ts(type = "Record<string, unknown>")]
    pub params: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "task.ts")]
pub struct CreateTaskResult {
    pub task_uid: String,
}

/// 队列侧的状态操作——都只是改数据库里的记录，不涉及真正终止/唤起一个执行中的进程
/// （执行引擎落地前，任务永远不会真的处于"有进程在跑"的中间态）。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "task.ts")]
pub enum TaskActionKind {
    Cancel,
    Pause,
    Resume,
    Retry,
    Restart,
}

impl TaskActionKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Cancel => "cancel",
            Self::Pause => "pause",
            Self::Resume => "resume",
            Self::Retry => "retry",
            Self::Restart => "restart",
        }
    }
}
