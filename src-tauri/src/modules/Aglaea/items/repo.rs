use rusqlite::{Connection, Row, params};

use super::domain::{Item, ItemCategory};

const SELECT_COLUMNS: &str = "SELECT id, name, icon, category, description, reference_price, created_at, updated_at FROM mhxy_items";

fn from_row(row: &Row<'_>) -> rusqlite::Result<Item> {
    Ok(Item {
        id: row.get(0)?,
        name: row.get(1)?,
        icon: row.get(2)?,
        category: row.get(3)?,
        description: row.get(4)?,
        reference_price: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

pub fn insert_item(
    conn: &Connection,
    name: &str,
    icon: Option<&str>,
    category: ItemCategory,
    description: &str,
    reference_price: Option<f64>,
) -> rusqlite::Result<i64> {
    conn.execute(
        "INSERT INTO mhxy_items (name, icon, category, description, reference_price)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, icon, category, description, reference_price],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn get_item(conn: &Connection, id: i64) -> rusqlite::Result<Option<Item>> {
    let mut statement = conn.prepare(&format!("{SELECT_COLUMNS} WHERE id = ?1"))?;
    let mut rows = statement.query_map(params![id], from_row)?;
    rows.next().transpose()
}

pub fn list_items(conn: &Connection) -> rusqlite::Result<Vec<Item>> {
    let mut statement = conn.prepare(&format!("{SELECT_COLUMNS} ORDER BY id"))?;
    statement.query_map([], from_row)?.collect()
}

/// 返回受影响的行数，0 表示 id 不存在。
pub fn update_item(
    conn: &Connection,
    id: i64,
    name: &str,
    icon: Option<&str>,
    category: ItemCategory,
    description: &str,
    reference_price: Option<f64>,
) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE mhxy_items
         SET name = ?2, icon = ?3, category = ?4, description = ?5,
             reference_price = ?6, updated_at = unixepoch()
         WHERE id = ?1",
        params![id, name, icon, category, description, reference_price],
    )
}

/// 返回受影响的行数，0 表示 id 不存在。
pub fn delete_item(conn: &Connection, id: i64) -> rusqlite::Result<usize> {
    conn.execute("DELETE FROM mhxy_items WHERE id = ?1", params![id])
}
