use std::sync::Arc;

use tauri::State;

use crate::database::state::DbState;
use super::domain::GuildShop;
use crate::shared::response::ApiResponse;
use super::service;

// 命令名带 aglaea_guild_shops_ 前缀：Tauri 的命令名全局唯一，加上模块名避免和其他模块的同名功能冲突。

#[tauri::command(async)]
pub fn aglaea_guild_shops_list(db: State<'_, Arc<DbState>>) -> ApiResponse<Vec<GuildShop>> {
    ApiResponse::from(service::list(&db))
}
