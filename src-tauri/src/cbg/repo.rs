use crate::domain::cbg::{CbgArea, CbgServer};
use rusqlite::{params, Connection};

/// 全量替换大区/服务器参考数据：先清空两张表，再按爬虫结果整体重建，
/// 保证库里的数据跟藏宝阁网站当前的大区服务器列表完全一致（不做增量 diff）。
pub fn replace_all(conn: &Connection, areas: &[CbgArea]) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM mhxy_cbg_servers", [])?;
    conn.execute("DELETE FROM mhxy_cbg_areas", [])?;
    for area in areas {
        conn.execute(
            "INSERT INTO mhxy_cbg_areas (area_id, name) VALUES (?1, ?2)",
            params![area.area_id, area.name],
        )?;
        for server in &area.children {
            conn.execute(
                "INSERT INTO mhxy_cbg_servers (server_id, area_id, name) VALUES (?1, ?2, ?3)",
                params![server.server_id, area.area_id, server.name],
            )?;
        }
    }
    Ok(())
}

pub fn list_areas(conn: &Connection) -> rusqlite::Result<Vec<CbgArea>> {
    let mut area_stmt =
        conn.prepare("SELECT area_id, name FROM mhxy_cbg_areas ORDER BY area_id")?;
    let areas: Vec<(i64, String)> = area_stmt
        .query_map([], |row| Ok((row.get("area_id")?, row.get("name")?)))?
        .collect::<rusqlite::Result<_>>()?;

    let mut server_stmt = conn.prepare(
        "SELECT server_id, name FROM mhxy_cbg_servers WHERE area_id = ?1 ORDER BY server_id",
    )?;

    areas
        .into_iter()
        .map(|(area_id, name)| {
            let children = server_stmt
                .query_map(params![area_id], |row| {
                    Ok(CbgServer {
                        server_id: row.get("server_id")?,
                        name: row.get("name")?,
                    })
                })?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            Ok(CbgArea {
                area_id,
                name,
                children,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn memory_conn() -> Connection {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite");
        conn.execute_batch(include_str!("../database/schema.sql"))
            .expect("apply schema");
        conn
    }

    fn sample_areas() -> Vec<CbgArea> {
        vec![
            CbgArea {
                name: "内蒙区".to_string(),
                area_id: 40,
                children: vec![CbgServer {
                    name: "雄鹰岭".to_string(),
                    server_id: 229,
                }],
            },
            CbgArea {
                name: "东北区".to_string(),
                area_id: 41,
                children: vec![
                    CbgServer {
                        name: "长白山".to_string(),
                        server_id: 300,
                    },
                    CbgServer {
                        name: "松花江".to_string(),
                        server_id: 301,
                    },
                ],
            },
        ]
    }

    #[test]
    fn replace_all_then_list_areas_round_trips() {
        let conn = memory_conn();
        replace_all(&conn, &sample_areas()).expect("replace_all");

        let areas = list_areas(&conn).expect("list_areas");

        assert_eq!(areas.len(), 2);
        assert_eq!(areas[0].area_id, 40);
        assert_eq!(areas[0].name, "内蒙区");
        assert_eq!(
            areas[0].children,
            vec![CbgServer {
                name: "雄鹰岭".to_string(),
                server_id: 229
            }]
        );
        assert_eq!(areas[1].children.len(), 2);
    }

    #[test]
    fn replace_all_clears_previous_data_instead_of_accumulating() {
        let conn = memory_conn();
        replace_all(&conn, &sample_areas()).expect("first replace_all");

        let second_run = vec![CbgArea {
            name: "内蒙区".to_string(),
            area_id: 40,
            children: vec![CbgServer {
                name: "雄鹰岭".to_string(),
                server_id: 229,
            }],
        }];
        replace_all(&conn, &second_run).expect("second replace_all");

        let areas = list_areas(&conn).expect("list_areas");
        assert_eq!(areas.len(), 1);
        assert_eq!(areas[0].children.len(), 1);
    }
}
