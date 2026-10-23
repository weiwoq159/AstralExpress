use crate::database::state::DbState;

use super::error::ItemError;
use super::repo;
use super::domain::{Item, ItemCategory};

/// 道具名上限，防止异常输入撑爆列表展示。
const NAME_MAX_CHARS: usize = 64;

/// 数据库约束是最后一道防线，这里先校验并规范化，是为了给调用方可读的错误。
fn clean_name(name: &str) -> Result<String, ItemError> {
    let name = name.trim();
    if name.is_empty() {
        return Err(ItemError::Invalid("道具名不能为空".to_string()));
    }
    if name.chars().count() > NAME_MAX_CHARS {
        return Err(ItemError::Invalid(format!(
            "道具名不能超过 {NAME_MAX_CHARS} 个字符"
        )));
    }
    Ok(name.to_string())
}

/// 价格必须是不小于 0 的有限数，并四舍五入到两位小数。
fn clean_price(price: Option<f64>) -> Result<Option<f64>, ItemError> {
    match price {
        Some(price) if !price.is_finite() || price < 0.0 => Err(ItemError::Invalid(
            "参考价必须是不小于 0 的数字".to_string(),
        )),
        Some(price) => Ok(Some((price * 100.0).round() / 100.0)),
        None => Ok(None),
    }
}

fn clean_icon(icon: Option<String>) -> Option<String> {
    icon.map(|icon| icon.trim().to_string())
        .filter(|icon| !icon.is_empty())
}

pub fn create(
    db: &DbState,
    name: &str,
    icon: Option<String>,
    category: ItemCategory,
    description: &str,
    reference_price: Option<f64>,
) -> Result<Item, ItemError> {
    let name = clean_name(name)?;
    let icon = clean_icon(icon);
    let price = clean_price(reference_price)?;
    let item = db.with_conn(|conn| {
        let id = repo::insert_item(conn, &name, icon.as_deref(), category, description, price)?;
        repo::get_item(conn, id)
    })?;
    // 刚插入的行读不到只可能是并发删除，按不存在处理。
    item.ok_or(ItemError::NotFound(0))
}

pub fn list(db: &DbState) -> Result<Vec<Item>, ItemError> {
    Ok(db.with_conn(repo::list_items)?)
}

pub fn update(
    db: &DbState,
    id: i64,
    name: &str,
    icon: Option<String>,
    category: ItemCategory,
    description: &str,
    reference_price: Option<f64>,
) -> Result<Item, ItemError> {
    let name = clean_name(name)?;
    let icon = clean_icon(icon);
    let price = clean_price(reference_price)?;
    db.with_conn(|conn| {
        let changed = repo::update_item(
            conn,
            id,
            &name,
            icon.as_deref(),
            category,
            description,
            price,
        )?;
        if changed == 0 {
            return Ok(None);
        }
        repo::get_item(conn, id)
    })?
    .ok_or(ItemError::NotFound(id))
}

pub fn delete(db: &DbState, id: i64) -> Result<(), ItemError> {
    if db.with_conn(|conn| repo::delete_item(conn, id))? == 0 {
        return Err(ItemError::NotFound(id));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn db() -> DbState {
        DbState::new(":memory:").expect("内存数据库初始化失败")
    }

    fn add(db: &DbState, name: &str, price: Option<f64>) -> Result<Item, ItemError> {
        create(db, name, None, ItemCategory::Misc, "", price)
    }

    #[test]
    fn create_normalizes_input() {
        let db = db();
        let item = add(&db, "  金创药 ", Some(12.345)).unwrap();
        assert_eq!(item.name, "金创药");
        assert_eq!(item.reference_price, Some(12.35));
        assert_eq!(list(&db).unwrap().len(), 1);
    }

    #[test]
    fn duplicate_and_invalid_input_are_rejected() {
        let db = db();
        add(&db, "金创药", None).unwrap();
        assert!(matches!(
            add(&db, "金创药", None),
            Err(ItemError::DuplicateName)
        ));
        assert!(matches!(add(&db, "   ", None), Err(ItemError::Invalid(_))));
        assert!(matches!(
            add(&db, "便宜货", Some(-1.0)),
            Err(ItemError::Invalid(_))
        ));
        assert!(matches!(
            add(&db, "非数", Some(f64::NAN)),
            Err(ItemError::Invalid(_))
        ));
    }

    #[test]
    fn category_round_trips_and_unknown_values_are_rejected() {
        let db = db();
        create(&db, "宝石", None, ItemCategory::Baoshi, "", None).unwrap();
        assert_eq!(list(&db).unwrap()[0].category, ItemCategory::Baoshi);

        // 绕过 Rust 直接写入非法分类，读取时必须报错而不是静默通过。
        db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO mhxy_items (name, category) VALUES ('脏数据', 'bogus')",
                [],
            )
        })
        .unwrap();
        assert!(matches!(list(&db), Err(ItemError::Database(_))));
    }

    #[test]
    fn update_and_delete_report_missing_ids() {
        let db = db();
        let item = add(&db, "金创药", None).unwrap();
        let updated = update(
            &db,
            item.id,
            "超级金创药",
            None,
            ItemCategory::Baoshi,
            "",
            Some(5.0),
        )
        .unwrap();
        assert_eq!(updated.name, "超级金创药");
        assert_eq!(updated.reference_price, Some(5.0));
        assert_eq!(updated.category, ItemCategory::Baoshi);
        assert!(matches!(
            update(&db, 999, "不存在", None, ItemCategory::Misc, "", None),
            Err(ItemError::NotFound(999))
        ));
        delete(&db, item.id).unwrap();
        assert!(matches!(delete(&db, item.id), Err(ItemError::NotFound(_))));
        assert!(list(&db).unwrap().is_empty());
    }
}
