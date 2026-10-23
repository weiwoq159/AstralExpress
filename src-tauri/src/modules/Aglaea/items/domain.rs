use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// 道具分类。变体名即取值（与藏宝阁的分类标识一致），数据库里存 snake_case 字符串。
/// 前端显示用的中文名在前端维护，这里的注释只是对照。
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "../../modules/Aglaea/domain/items/")]
pub enum ItemCategory {
    /// 宝石
    Baoshi,
    /// 环装
    Huanzhuang,
    /// 五宝
    Wubao,
    /// 炼妖石
    Lianyaoshi,
    /// 杂货
    #[default]
    Misc,
    /// 宝图
    Baotu,
    /// 低兽决
    Shoujue,
    /// 高兽决
    Gaoshoujue,
    /// 灵饰晶石
    Lingshijingshi,
    /// 内丹
    Neidan,
    /// 高内丹
    Gaoneidan,
    /// 特殊兽决
    Teshushoujue,
    /// 钟灵石
    Zhonglingshi,
    /// 书铁
    Shutie,
    /// 附魔宝珠
    Fumobaozhu,
    /// 召唤兽洗练
    Xilian,
    /// 珍珠
    Zhenzhu,
    /// 自定义
    Custom,
}

// 取值只由 serde 的重命名规则决定，数据库和 IPC 共用同一份定义，避免再手写一张对照表。
impl ToSql for ItemCategory {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        match serde_json::to_value(self) {
            Ok(serde_json::Value::String(value)) => Ok(ToSqlOutput::from(value)),
            Ok(_) => Err(rusqlite::Error::ToSqlConversionFailure(
                "ItemCategory 必须序列化为字符串".into(),
            )),
            Err(error) => Err(rusqlite::Error::ToSqlConversionFailure(Box::new(error))),
        }
    }
}

impl FromSql for ItemCategory {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        let text = value.as_str()?;
        serde_json::from_value(serde_json::Value::String(text.to_string()))
            .map_err(|_| FromSqlError::Other(format!("未知的道具分类：{text}").into()))
    }
}

#[derive(Debug, Clone, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../modules/Aglaea/domain/items/")]
pub struct Item {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    /// 图标文件相对于应用数据目录的路径。
    pub icon: Option<String>,
    pub category: ItemCategory,
    pub description: String,
    pub reference_price: Option<f64>,
    /// Unix 秒。
    #[ts(type = "number")]
    pub created_at: i64,
    #[ts(type = "number")]
    pub updated_at: i64,
}
