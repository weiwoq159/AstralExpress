use rusqlite::{Connection, Row};

use super::domain::GuildShop;

const SELECT_COLUMNS: &str =
    "SELECT id, area_id, server_id, number, name, discount_percent, created_at, updated_at FROM guild_shops";

fn from_row(row: &Row<'_>) -> rusqlite::Result<GuildShop> {
    Ok(GuildShop {
        id: row.get(0)?,
        area_id: row.get(1)?,
        server_id: row.get(2)?,
        number: row.get(3)?,
        name: row.get(4)?,
        discount_percent: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

/// 按大区、服务器、店铺编号排序，顺序与唯一约束 (area_id, server_id, number) 一致，可直接走该索引。
pub fn list_shops(conn: &Connection) -> rusqlite::Result<Vec<GuildShop>> {
    let mut statement =
        conn.prepare(&format!("{SELECT_COLUMNS} ORDER BY area_id, server_id, number"))?;
    statement.query_map([], from_row)?.collect()
}
