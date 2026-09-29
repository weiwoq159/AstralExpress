use serde::Serialize;
use std::fmt::Display;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "response.ts")]
pub struct ApiResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub code: u32,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            ok: true,
            data: Some(data),
            error: None,
            code: 200,
        }
    }

    pub fn failure(error: impl Display) -> Self {
        Self {
            ok: false,
            data: None,
            error: Some(error.to_string()),
            code: 500,
        }
    }
}

impl<T, E: Display> From<Result<T, E>> for ApiResponse<T> {
    fn from(result: Result<T, E>) -> Self {
        match result {
            Ok(data) => Self::success(data),
            Err(e) => Self::failure(e),
        }
    }
}
