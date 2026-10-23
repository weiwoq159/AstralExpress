use rusqlite::ErrorCode;

#[derive(Debug, thiserror::Error)]
pub enum ItemError {
    /// 调用方传入的数据不合法。
    #[error("{0}")]
    Invalid(String),
    #[error("道具名已存在")]
    DuplicateName,
    #[error("道具不存在：{0}")]
    NotFound(i64),
    #[error("数据库错误：{0}")]
    Database(rusqlite::Error),
}

// 不能用 #[from]：需要先把 name 的唯一约束冲突翻译成可读的业务错误。
impl From<rusqlite::Error> for ItemError {
    fn from(error: rusqlite::Error) -> Self {
        // 其余约束冲突保持原样。
        if let rusqlite::Error::SqliteFailure(failure, Some(message)) = &error
            && failure.code == ErrorCode::ConstraintViolation
            && message.contains("mhxy_items.name")
        {
            return Self::DuplicateName;
        }
        Self::Database(error)
    }
}
