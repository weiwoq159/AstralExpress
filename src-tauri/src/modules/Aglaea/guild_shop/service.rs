use crate::database::state::DbState;
use super::domain::GuildShop;

use super::error::GuildShopError;
use super::repo;

pub fn list(db: &DbState) -> Result<Vec<GuildShop>, GuildShopError> {
    Ok(db.with_conn(repo::list_shops)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn db() -> DbState {
        DbState::new(":memory:").expect("内存数据库初始化失败")
    }

    fn insert(db: &DbState, area_id: i64, server_id: i64, number: i64, name: &str) {
        db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO guild_shops (area_id, server_id, number, name) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![area_id, server_id, number, name],
            )
        })
        .unwrap();
    }

    #[test]
    fn list_is_empty_without_shops() {
        assert!(list(&db()).unwrap().is_empty());
    }

    #[test]
    fn discount_defaults_to_none_and_rejects_out_of_range() {
        let db = db();
        insert(&db, 1, 1, 1, "无折扣");
        db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO guild_shops (area_id, server_id, number, name, discount_percent)
                 VALUES (1, 1, 2, '优惠一成', 10)",
                [],
            )
        })
        .unwrap();

        let discounts: Vec<i64> = list(&db).unwrap().into_iter().map(|shop| shop.discount_percent).collect();
        assert_eq!(discounts, [0, 10]);

        for invalid in [-1, 100] {
            let result = db.with_conn(|conn| {
                conn.execute(
                    "INSERT INTO guild_shops (area_id, server_id, number, name, discount_percent)
                     VALUES (1, 1, 3, '非法', ?1)",
                    [invalid],
                )
            });
            assert!(result.is_err(), "折扣 {invalid} 应被拒绝");
        }
    }

    #[test]
    fn list_orders_by_area_server_then_number() {
        let db = db();
        insert(&db, 2, 1, 1, "乙区一服一号");
        insert(&db, 1, 2, 1, "甲区二服一号");
        insert(&db, 1, 1, 9, "甲区一服九号");
        insert(&db, 1, 1, 3, "甲区一服三号");

        let names: Vec<String> = list(&db).unwrap().into_iter().map(|shop| shop.name).collect();
        assert_eq!(
            names,
            ["甲区一服三号", "甲区一服九号", "甲区二服一号", "乙区一服一号"]
        );
    }
}
