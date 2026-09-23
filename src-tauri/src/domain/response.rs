use serde::Serialize;
use std::fmt;
use ts_rs::TS;

pub const CODE_OK: u32 = 0;
pub const CODE_MANIFEST_DIR: u32 = 100;
pub const CODE_MANIFEST_IO: u32 = 101;
pub const CODE_MANIFEST_PARSE: u32 = 102;
pub const CODE_TASK_UNKNOWN_MANIFEST: u32 = 200;
pub const CODE_TASK_CATALOG: u32 = 201;
pub const CODE_TASK_DB: u32 = 202;
pub const CODE_TASK_NOT_FOUND: u32 = 203;
pub const CODE_TASK_INVALID_TRANSITION: u32 = 204;
pub const CODE_CONFIG_UNKNOWN_MANIFEST: u32 = 300;
pub const CODE_CONFIG_CATALOG: u32 = 301;
pub const CODE_CONFIG_DB: u32 = 302;

pub trait ApiError: fmt::Display {
    fn code(&self) -> u32;
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "response.ts")]
pub struct ApiResponse<T> {
    pub code: u32,
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T, code: u32) -> Self {
        Self {
            code,
            ok: true,
            data: Some(data),
            error: None,
        }
    }
    pub fn failure(error: impl Into<String>, code: u32) -> Self {
        Self {
            code,
            ok: false,
            data: None,
            error: Some(error.into()),
        }
    }
    pub fn from_result<E: ApiError>(result: Result<T, E>) -> Self {
        match result {
            Ok(data) => Self::success(data, CODE_OK),
            Err(error) => Self::failure(error.to_string(), error.code()),
        }
    }
}
