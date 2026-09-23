use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// 插件目录的顶层分类，对应 `plugins/<as_str()>/` 目录名。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "module.ts")]
pub enum ModuleId {
    Tools,
    Crawler,
}

impl ModuleId {
    /// 与 `plugins/` 下的目录名、数据库 module_id 列的取值保持一致
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Tools => "tools",
            Self::Crawler => "crawler",
        }
    }
}

impl ToSql for ModuleId {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(self.as_str()))
    }
}

impl FromSql for ModuleId {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        match value.as_str()? {
            "tools" => Ok(Self::Tools),
            "crawler" => Ok(Self::Crawler),
            _ => Err(FromSqlError::InvalidType),
        }
    }
}
