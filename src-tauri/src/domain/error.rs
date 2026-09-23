use crate::domain::module::ModuleId;
use crate::domain::response::{
    ApiError, CODE_CONFIG_CATALOG, CODE_CONFIG_DB, CODE_CONFIG_UNKNOWN_MANIFEST, CODE_MANIFEST_DIR,
    CODE_MANIFEST_IO, CODE_MANIFEST_PARSE, CODE_TASK_CATALOG, CODE_TASK_DB,
    CODE_TASK_INVALID_TRANSITION, CODE_TASK_NOT_FOUND, CODE_TASK_UNKNOWN_MANIFEST,
};
use crate::domain::task::{TaskActionKind, TaskStatus};
use std::fmt;

#[derive(Debug)]
pub enum ManifestError {
    DirectoryUnavailable { module_id: ModuleId, reason: String },
    ReadFailed { path: String, reason: String },
    ParseFailed { path: String, reason: String },
}
impl fmt::Display for ManifestError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DirectoryUnavailable { module_id, reason } => {
                write!(
                    f,
                    "无法读取模块 {} 的插件目录：{reason}",
                    module_id.as_str()
                )
            }
            Self::ReadFailed { path, reason } => write!(f, "无法读取 {path}：{reason}"),
            Self::ParseFailed { path, reason } => write!(f, "无法解析 {path}：{reason}"),
        }
    }
}
impl std::error::Error for ManifestError {}
impl ApiError for ManifestError {
    fn code(&self) -> u32 {
        match self {
            Self::DirectoryUnavailable { .. } => CODE_MANIFEST_DIR,
            Self::ReadFailed { .. } => CODE_MANIFEST_IO,
            Self::ParseFailed { .. } => CODE_MANIFEST_PARSE,
        }
    }
}

#[derive(Debug)]
pub enum TaskError {
    UnknownManifest {
        module_id: ModuleId,
        manifest_key: String,
    },
    /// 校验 manifest 是否存在时，扫描本身失败（目录不可读等）。
    CatalogUnavailable {
        reason: String,
    },
    Database {
        action: String,
        reason: String,
    },
    NotFound {
        task_uid: String,
    },
    /// 当前状态不允许执行该操作，比如对一个 success 状态的任务点"取消"。
    InvalidTransition {
        task_uid: String,
        status: TaskStatus,
        action: TaskActionKind,
    },
}
impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnknownManifest {
                module_id,
                manifest_key,
            } => {
                write!(
                    f,
                    "模块 {} 下不存在 key 为 {manifest_key} 的 manifest",
                    module_id.as_str()
                )
            }
            Self::CatalogUnavailable { reason } => write!(f, "无法校验 manifest：{reason}"),
            Self::Database { action, reason } => write!(f, "{action}失败：{reason}"),
            Self::NotFound { task_uid } => write!(f, "任务 {task_uid} 不存在"),
            Self::InvalidTransition {
                task_uid,
                status,
                action,
            } => write!(
                f,
                "任务 {task_uid} 当前状态为 {}，无法执行 {} 操作",
                status.as_str(),
                action.as_str()
            ),
        }
    }
}
impl std::error::Error for TaskError {}
impl ApiError for TaskError {
    fn code(&self) -> u32 {
        match self {
            Self::UnknownManifest { .. } => CODE_TASK_UNKNOWN_MANIFEST,
            Self::CatalogUnavailable { .. } => CODE_TASK_CATALOG,
            Self::Database { .. } => CODE_TASK_DB,
            Self::NotFound { .. } => CODE_TASK_NOT_FOUND,
            Self::InvalidTransition { .. } => CODE_TASK_INVALID_TRANSITION,
        }
    }
}

#[derive(Debug)]
pub enum ManifestConfigError {
    UnknownManifest {
        module_id: ModuleId,
        manifest_key: String,
    },
    /// 校验 manifest 是否存在时，扫描本身失败（目录不可读等）。
    CatalogUnavailable {
        reason: String,
    },
    Database {
        action: String,
        reason: String,
    },
}
impl fmt::Display for ManifestConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnknownManifest {
                module_id,
                manifest_key,
            } => {
                write!(
                    f,
                    "模块 {} 下不存在 key 为 {manifest_key} 的 manifest",
                    module_id.as_str()
                )
            }
            Self::CatalogUnavailable { reason } => write!(f, "无法校验 manifest：{reason}"),
            Self::Database { action, reason } => write!(f, "{action}失败：{reason}"),
        }
    }
}
impl std::error::Error for ManifestConfigError {}
impl ApiError for ManifestConfigError {
    fn code(&self) -> u32 {
        match self {
            Self::UnknownManifest { .. } => CODE_CONFIG_UNKNOWN_MANIFEST,
            Self::CatalogUnavailable { .. } => CODE_CONFIG_CATALOG,
            Self::Database { .. } => CODE_CONFIG_DB,
        }
    }
}
