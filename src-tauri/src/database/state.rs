use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub struct DbState {
    conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(path: impl AsRef<Path>) -> rusqlite::Result<Self> {
        let conn = Connection::open(path)?;
        // SQLite 的外键约束默认关闭，且按连接生效；task_events 的级联删除依赖它。
        conn.pragma_update(None, "foreign_keys", true)?;
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
