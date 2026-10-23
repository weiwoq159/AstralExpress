use std::sync::Arc;

use tauri::State;

use crate::database::state::DbState;
use super::domain::{Item, ItemCategory};
use crate::shared::response::ApiResponse;
use super::service;

// 命令名带 aglaea_items_ 前缀：Tauri 的命令名全局唯一，加上模块名避免和其他模块的同名功能冲突。
// 同步函数加 `async` 让 Tauri 把它放到线程池执行，避免数据库调用阻塞主线程。

#[tauri::command(async)]
pub fn aglaea_items_list(db: State<'_, Arc<DbState>>) -> ApiResponse<Vec<Item>> {
    ApiResponse::from(service::list(&db))
}

#[tauri::command(async)]
pub fn aglaea_items_insert(
    db: State<'_, Arc<DbState>>,
    name: String,
    icon: Option<String>,
    category: Option<ItemCategory>,
    description: Option<String>,
    reference_price: Option<f64>,
) -> ApiResponse<Item> {
    ApiResponse::from(service::create(
        &db,
        &name,
        icon,
        category.unwrap_or_default(),
        description.as_deref().unwrap_or_default(),
        reference_price,
    ))
}
