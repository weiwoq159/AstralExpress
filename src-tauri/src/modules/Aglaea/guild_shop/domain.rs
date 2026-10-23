use serde::Serialize;
use ts_rs::TS;

/// 商会店铺。店铺编号只在同一服务器内唯一，所以定位一家店要用 (area_id, server_id, number)。
#[derive(Debug, Clone, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../modules/Aglaea/domain/guild_shop/")]
pub struct GuildShop {
    #[ts(type = "number")]
    pub id: i64,
    /// 游戏内的大区标识。
    #[ts(type = "number")]
    pub area_id: i64,
    /// 游戏内的服务器标识。
    #[ts(type = "number")]
    pub server_id: i64,
    /// 游戏内的店铺编号。
    #[ts(type = "number")]
    pub number: i64,
    pub name: String,
    /// 店铺折扣，优惠的百分比：10 表示优惠 10%，0 表示不优惠。折后价 = 货架价 × (100 - 折扣) / 100。
    #[ts(type = "number")]
    pub discount_percent: i64,
    /// Unix 秒。
    #[ts(type = "number")]
    pub created_at: i64,
    #[ts(type = "number")]
    pub updated_at: i64,
}
