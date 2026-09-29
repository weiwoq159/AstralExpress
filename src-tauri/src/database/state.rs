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
