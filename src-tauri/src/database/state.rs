use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub struct DbState {
    conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(path: impl AsRef<Path>) -> rusqlite::Result<Self> {
        let conn = Connection::open(path)?;
        // 开发过程中 mhxy_cbg_schools 先建成了 name 列。CREATE TABLE IF NOT EXISTS 不会改已有表，
        // schema 里随后给 school_name 建索引，启动就会报 no such column。套用 schema 前先把旧列迁走。
        align_legacy_schools_table(&conn)?;
        conn.execute_batch(include_str!("schema.sql"))?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn with_conn<T>(
        &self,
        f: impl FnOnce(&Connection) -> rusqlite::Result<T>,
    ) -> rusqlite::Result<T> {
        let conn = self
            .conn
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        f(&conn)
    }
}

/// 把还在用 `name` 列的早期 `mhxy_cbg_schools` 换成 `school_name`。
/// 表不存在，或已经是新结构时什么都不做。已有行按 school_id 原样搬过去。
fn align_legacy_schools_table(conn: &Connection) -> rusqlite::Result<()> {
    let mut info = conn.prepare("PRAGMA table_info(mhxy_cbg_schools)")?;
    let columns: Vec<String> = info
        .query_map([], |row| row.get(1))?
        .collect::<rusqlite::Result<_>>()?;
    if columns.is_empty()
        || columns.iter().any(|column| column == "school_name")
        || !columns.iter().any(|column| column == "name")
    {
        return Ok(());
    }

    conn.execute_batch(
        "
        CREATE TABLE mhxy_cbg_schools_new (
            school_id INTEGER PRIMARY KEY,
            school_name TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
        INSERT INTO mhxy_cbg_schools_new (school_id, school_name)
            SELECT school_id, name FROM mhxy_cbg_schools;
        DROP TABLE mhxy_cbg_schools;
        ALTER TABLE mhxy_cbg_schools_new RENAME TO mhxy_cbg_schools;
        ",
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn legacy_schools_name_column_survives_schema_apply() {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite");
        conn.execute_batch(
            "CREATE TABLE mhxy_cbg_schools (school_id INTEGER PRIMARY KEY, name TEXT NOT NULL);
             INSERT INTO mhxy_cbg_schools (school_id, name) VALUES (1, '大唐官府');",
        )
        .expect("seed legacy table");

        align_legacy_schools_table(&conn).expect("align");
        conn.execute_batch(include_str!("schema.sql"))
            .expect("apply schema");

        let school_name: String = conn
            .query_row(
                "SELECT school_name FROM mhxy_cbg_schools WHERE school_id = 1",
                [],
                |row| row.get(0),
            )
            .expect("query");
        assert_eq!(school_name, "大唐官府");

        align_legacy_schools_table(&conn).expect("second align leaves the new table alone");
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM mhxy_cbg_schools", [], |row| {
                row.get(0)
            })
            .expect("count");
        assert_eq!(count, 1);
    }
}
