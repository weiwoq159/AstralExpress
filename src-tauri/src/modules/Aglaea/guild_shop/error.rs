#[derive(Debug, thiserror::Error)]
pub enum GuildShopError {
    #[error("数据库错误：{0}")]
    Database(#[from] rusqlite::Error),
}
