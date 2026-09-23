use crate::domain::manifest_config::ManifestConfig;
use crate::domain::module::ModuleId;
use rusqlite::{params, Connection, OptionalExtension, Row};

const COLUMNS: &str = "module_id, manifest_key, config_json, updated_at";

pub fn upsert(
    conn: &Connection,
    module_id: ModuleId,
    manifest_key: &str,
    config_json: &str,
) -> rusqlite::Result<usize> {
    conn.execute(
        "INSERT INTO manifest_configs (module_id, manifest_key, config_json) VALUES (?1, ?2, ?3) \
         ON CONFLICT (module_id, manifest_key) DO UPDATE SET \
         config_json = excluded.config_json, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
        params![module_id, manifest_key, config_json],
    )
}

pub fn get(
    conn: &Connection,
    module_id: ModuleId,
    manifest_key: &str,
) -> rusqlite::Result<Option<ManifestConfig>> {
    conn.query_row(
        &format!(
            "SELECT {COLUMNS} FROM manifest_configs WHERE module_id = ?1 AND manifest_key = ?2"
        ),
        params![module_id, manifest_key],
        config_from_row,
    )
    .optional()
}

/// 某个模块当前在库里已经有配置行的 manifest key 集合，供启动同步做差集用。
pub fn list_keys(conn: &Connection, module_id: ModuleId) -> rusqlite::Result<Vec<String>> {
    let mut stmt =
        conn.prepare("SELECT manifest_key FROM manifest_configs WHERE module_id = ?1")?;
    let rows = stmt.query_map(params![module_id], |row| row.get::<_, String>(0))?;
    rows.collect()
}

pub fn delete(
    conn: &Connection,
    module_id: ModuleId,
    manifest_key: &str,
) -> rusqlite::Result<usize> {
    conn.execute(
        "DELETE FROM manifest_configs WHERE module_id = ?1 AND manifest_key = ?2",
        params![module_id, manifest_key],
    )
}

fn config_from_row(row: &Row<'_>) -> rusqlite::Result<ManifestConfig> {
    let config_json: String = row.get("config_json")?;
    let config = serde_json::from_str(&config_json).unwrap_or(serde_json::Value::Null);
    Ok(ManifestConfig {
        module_id: row.get("module_id")?,
        manifest_key: row.get("manifest_key")?,
        config,
        updated_at: row.get("updated_at")?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn memory_conn() -> Connection {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite");
        conn.execute_batch(include_str!("../database/schema.sql"))
            .expect("apply schema");
        conn
    }

    #[test]
    fn get_returns_none_when_missing() {
        let conn = memory_conn();
        assert!(get(&conn, ModuleId::Crawler, "mhxy-cbg")
            .expect("query")
            .is_none());
    }

    #[test]
    fn upsert_then_get_round_trips() {
        let conn = memory_conn();
        upsert(&conn, ModuleId::Crawler, "mhxy-cbg", r#"{"cookie":"a=1"}"#).expect("insert");

        let config = get(&conn, ModuleId::Crawler, "mhxy-cbg")
            .expect("query")
            .expect("row exists");
        assert_eq!(config.config, serde_json::json!({ "cookie": "a=1" }));
    }

    #[test]
    fn upsert_twice_overwrites_instead_of_duplicating() {
        let conn = memory_conn();
        upsert(&conn, ModuleId::Crawler, "mhxy-cbg", r#"{"cookie":"a=1"}"#).expect("first insert");
        upsert(&conn, ModuleId::Crawler, "mhxy-cbg", r#"{"cookie":"a=2"}"#).expect("second insert");

        let config = get(&conn, ModuleId::Crawler, "mhxy-cbg")
            .expect("query")
            .expect("row exists");
        assert_eq!(config.config, serde_json::json!({ "cookie": "a=2" }));

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM manifest_configs", [], |row| {
                row.get(0)
            })
            .expect("count");
        assert_eq!(count, 1);
    }

    #[test]
    fn list_keys_scopes_by_module_id() {
        let conn = memory_conn();
        upsert(&conn, ModuleId::Crawler, "mhxy-cbg", "{}").expect("insert crawler row");
        upsert(&conn, ModuleId::Tools, "batch-rename", "{}").expect("insert tools row");

        let keys = list_keys(&conn, ModuleId::Crawler).expect("list keys");

        assert_eq!(keys, vec!["mhxy-cbg".to_string()]);
    }

    #[test]
    fn delete_removes_the_row() {
        let conn = memory_conn();
        upsert(&conn, ModuleId::Crawler, "mhxy-cbg", "{}").expect("insert");

        let affected = delete(&conn, ModuleId::Crawler, "mhxy-cbg").expect("delete");

        assert_eq!(affected, 1);
        assert!(get(&conn, ModuleId::Crawler, "mhxy-cbg")
            .expect("query")
            .is_none());
    }
}
