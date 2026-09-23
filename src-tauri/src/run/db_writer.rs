use rusqlite::types::{ToSqlOutput, Value as SqlLiteralValue};
use rusqlite::ToSql;
use serde_json::{Map, Value};

/// 插件脚本能通过 "db" 类型的执行消息写入的表和列的白名单。表名/列名不能像值一样参数化绑定，
/// 只能拼进 SQL 文本里，所以必须先卡在这道白名单上——不在表里的表/列一律拒绝，不管脚本是写
/// 错了 key 还是被抓取内容污染了字段名。
const WRITABLE_TABLES: &[(&str, &[&str])] = &[
    ("mhxy_cbg_areas", &["area_id", "name"]),
    ("mhxy_cbg_servers", &["server_id", "area_id", "name"]),
    ("mhxy_cbg_pets", &["pet_id", "name"]),
    ("mhxy_cbg_schools", &["school_id", "school_name"]),
];

#[derive(Debug)]
pub enum SqlValue {
    Text(String),
    Integer(i64),
    Real(f64),
    Bool(bool),
    Null,
}

impl ToSql for SqlValue {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        Ok(match self {
            Self::Text(text) => ToSqlOutput::from(text.as_str()),
            Self::Integer(number) => ToSqlOutput::from(*number),
            Self::Real(number) => ToSqlOutput::from(*number),
            Self::Bool(flag) => ToSqlOutput::from(*flag),
            Self::Null => ToSqlOutput::Owned(SqlLiteralValue::Null),
        })
    }
}

fn json_to_sql_value(value: &Value) -> Result<SqlValue, String> {
    match value {
        Value::String(text) => Ok(SqlValue::Text(text.clone())),
        Value::Number(number) if number.is_i64() => {
            Ok(SqlValue::Integer(number.as_i64().expect("checked is_i64")))
        }
        Value::Number(number) if number.is_u64() => Ok(SqlValue::Integer(
            number.as_u64().expect("checked is_u64") as i64,
        )),
        Value::Number(number) => number
            .as_f64()
            .map(SqlValue::Real)
            .ok_or_else(|| "非法数字字段".to_string()),
        Value::Bool(flag) => Ok(SqlValue::Bool(*flag)),
        Value::Null => Ok(SqlValue::Null),
        other => Err(format!("不支持写入这种字段类型：{other}")),
    }
}

/// 校验 (table, value 的每个 key) 都在白名单内，拼出 "INSERT OR REPLACE" 的 SQL 文本和按位置
/// 对应的绑定值。纯逻辑，不接触数据库连接——校验失败不需要真的碰一下 SQLite 才知道。
///
/// 用 INSERT OR REPLACE 而不是 INSERT：这几张参考数据表的主键就是网站上的真实 id
/// （area_id/server_id），重复抓到同一条要更新而不是报唯一约束冲突。
pub fn build_insert(
    table: &str,
    value: &Map<String, Value>,
) -> Result<(String, Vec<SqlValue>), String> {
    let allowed_columns = WRITABLE_TABLES
        .iter()
        .find(|(name, _)| *name == table)
        .map(|(_, columns)| *columns)
        .ok_or_else(|| format!("不允许写入表：{table}"))?;

    if value.is_empty() {
        return Err("db 写入消息缺少 value 字段".to_string());
    }

    let mut columns = Vec::with_capacity(value.len());
    let mut bound = Vec::with_capacity(value.len());
    for (column, json_value) in value {
        if !allowed_columns.contains(&column.as_str()) {
            return Err(format!("表 {table} 不允许写入列：{column}"));
        }
        columns.push(column.as_str());
        bound.push(json_to_sql_value(json_value)?);
    }

    let placeholders: Vec<String> = (1..=columns.len())
        .map(|index| format!("?{index}"))
        .collect();
    let sql = format!(
        "INSERT OR REPLACE INTO {table} ({}) VALUES ({})",
        columns.join(", "),
        placeholders.join(", ")
    );
    Ok((sql, bound))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn value_map(pairs: &[(&str, Value)]) -> Map<String, Value> {
        pairs
            .iter()
            .map(|(key, value)| (key.to_string(), value.clone()))
            .collect()
    }

    #[test]
    fn builds_insert_or_replace_for_whitelisted_table() {
        let value = value_map(&[("area_id", json!(40)), ("name", json!("内蒙区"))]);
        let (sql, bound) = build_insert("mhxy_cbg_areas", &value).expect("should build");
        assert!(sql.starts_with("INSERT OR REPLACE INTO mhxy_cbg_areas"));
        assert_eq!(bound.len(), 2);
    }

    #[test]
    fn rejects_table_not_in_whitelist() {
        let value = value_map(&[("id", json!(1))]);
        let error = build_insert("tasks", &value).expect_err("should reject");
        assert!(error.contains("不允许写入表"));
    }

    #[test]
    fn rejects_column_not_in_whitelist_even_for_a_known_table() {
        let value = value_map(&[("area_id", json!(40)), ("updated_at", json!("2026-01-01"))]);
        let error = build_insert("mhxy_cbg_areas", &value).expect_err("should reject");
        assert!(error.contains("不允许写入列"));
    }

    #[test]
    fn actually_inserts_and_replaces_via_real_connection() {
        let conn = rusqlite::Connection::open_in_memory().expect("open in-memory sqlite");
        conn.execute_batch(include_str!("../database/schema.sql"))
            .expect("apply schema");

        let first = value_map(&[("area_id", json!(40)), ("name", json!("内蒙区"))]);
        let (sql, bound) = build_insert("mhxy_cbg_areas", &first).expect("build first");
        let params: Vec<&dyn ToSql> = bound.iter().map(|value| value as &dyn ToSql).collect();
        conn.execute(&sql, rusqlite::params_from_iter(params))
            .expect("insert");

        let second = value_map(&[("area_id", json!(40)), ("name", json!("内蒙区（改名）"))]);
        let (sql, bound) = build_insert("mhxy_cbg_areas", &second).expect("build second");
        let params: Vec<&dyn ToSql> = bound.iter().map(|value| value as &dyn ToSql).collect();
        conn.execute(&sql, rusqlite::params_from_iter(params))
            .expect("replace");

        let name: String = conn
            .query_row(
                "SELECT name FROM mhxy_cbg_areas WHERE area_id = 40",
                [],
                |row| row.get(0),
            )
            .expect("query");
        assert_eq!(name, "内蒙区（改名）");
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM mhxy_cbg_areas", [], |row| row.get(0))
            .expect("count");
        assert_eq!(count, 1);
    }
}
