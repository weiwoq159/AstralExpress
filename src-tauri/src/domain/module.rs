use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "module.ts")]
pub enum ModuleId {
    Tool,
    Crawler,
}

impl ModuleId {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Tool => "tool",
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
            "tool" => Ok(Self::Tool),
            "crawler" => Ok(Self::Crawler),
            _ => Err(FromSqlError::InvalidType),
        }
    }
}
