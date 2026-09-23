use super::repo;
use crate::catalog;
use crate::database::state::DbState;
use crate::domain::error::ManifestConfigError;
use crate::domain::manifest_config::{ManifestConfig, SetManifestConfig};
use crate::domain::module::ModuleId;
use std::collections::HashSet;

fn ensure_manifest_exists(
    module_id: ModuleId,
    manifest_key: &str,
) -> Result<(), ManifestConfigError> {
    let exists = catalog::contains(module_id, manifest_key).map_err(|error| {
        ManifestConfigError::CatalogUnavailable {
            reason: error.to_string(),
        }
    })?;
    if !exists {
        return Err(ManifestConfigError::UnknownManifest {
            module_id,
            manifest_key: manifest_key.to_string(),
        });
    }
    Ok(())
}

pub fn set(db: &DbState, input: SetManifestConfig) -> Result<ManifestConfig, ManifestConfigError> {
    ensure_manifest_exists(input.module_id, &input.manifest_key)?;

    db.with_conn(|conn| {
        repo::upsert(
            conn,
            input.module_id,
            &input.manifest_key,
            &input.config.to_string(),
        )
    })
    .map_err(|error| ManifestConfigError::Database {
        action: "保存配置".to_string(),
        reason: error.to_string(),
    })?;

    db.with_conn(|conn| repo::get(conn, input.module_id, &input.manifest_key))
        .map_err(|error| ManifestConfigError::Database {
            action: "读取配置".to_string(),
            reason: error.to_string(),
        })?
        .ok_or_else(|| ManifestConfigError::Database {
            action: "读取配置".to_string(),
            reason: "写入后未能读回记录".to_string(),
        })
}

pub fn get(
    db: &DbState,
    module_id: ModuleId,
    manifest_key: &str,
) -> Result<Option<ManifestConfig>, ManifestConfigError> {
    ensure_manifest_exists(module_id, manifest_key)?;

    db.with_conn(|conn| repo::get(conn, module_id, manifest_key))
        .map_err(|error| ManifestConfigError::Database {
            action: "读取配置".to_string(),
            reason: error.to_string(),
        })
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct SyncSummary {
    pub inserted: usize,
    pub deleted: usize,
}

/// 让 module_id 下的配置行跟磁盘上实际扫描到的 manifest 保持一一对应：新出现的 manifest
/// 补一条空配置，磁盘上已经不存在的 manifest 把配置行删掉。应用启动时跑一次，不对外暴露成命令。
pub fn sync(db: &DbState, module_id: ModuleId) -> Result<SyncSummary, ManifestConfigError> {
    let disk_keys: HashSet<String> = catalog::manifest_scanner::manifests(module_id)
        .map_err(|error| ManifestConfigError::CatalogUnavailable {
            reason: error.to_string(),
        })?
        .into_iter()
        .map(|manifest| manifest.key)
        .collect();

    let db_keys: HashSet<String> = db
        .with_conn(|conn| repo::list_keys(conn, module_id))
        .map_err(|error| ManifestConfigError::Database {
            action: "读取配置列表".to_string(),
            reason: error.to_string(),
        })?
        .into_iter()
        .collect();

    let to_insert: Vec<&String> = disk_keys.difference(&db_keys).collect();
    let to_delete: Vec<&String> = db_keys.difference(&disk_keys).collect();
    let summary = SyncSummary {
        inserted: to_insert.len(),
        deleted: to_delete.len(),
    };

    db.with_conn(|conn| {
        for key in &to_insert {
            repo::upsert(conn, module_id, key, "{}")?;
        }
        for key in &to_delete {
            repo::delete(conn, module_id, key)?;
        }
        Ok(())
    })
    .map_err(|error| ManifestConfigError::Database {
        action: "同步配置表".to_string(),
        reason: error.to_string(),
    })?;

    Ok(summary)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn memory_db() -> DbState {
        DbState::new(":memory:").expect("open in-memory sqlite")
    }

    #[test]
    fn set_rejects_unknown_manifest_key() {
        let db = memory_db();
        let error = set(
            &db,
            SetManifestConfig {
                module_id: ModuleId::Crawler,
                manifest_key: "does-not-exist".to_string(),
                config: json!({}),
            },
        )
        .expect_err("should reject unknown manifest key");

        assert!(matches!(error, ManifestConfigError::UnknownManifest { .. }));
    }

    #[test]
    fn get_returns_none_before_any_set() {
        let db = memory_db();
        // mhxy-cbg 是 plugins/crawler/mhxy-cbg/manifest.json 里真实存在的 key。
        let config = get(&db, ModuleId::Crawler, "mhxy-cbg")
            .expect("get should succeed against a real manifest");
        assert!(config.is_none());
    }

    #[test]
    fn set_then_get_round_trips_against_real_catalog() {
        let db = memory_db();
        let saved = set(
            &db,
            SetManifestConfig {
                module_id: ModuleId::Crawler,
                manifest_key: "mhxy-cbg".to_string(),
                config: json!({ "cookie": "a=1", "intervalMs": 800 }),
            },
        )
        .expect("set should succeed for a real manifest key");

        assert_eq!(saved.config, json!({ "cookie": "a=1", "intervalMs": 800 }));

        let fetched = get(&db, ModuleId::Crawler, "mhxy-cbg")
            .expect("get should succeed")
            .expect("config should exist");
        assert_eq!(
            fetched.config,
            json!({ "cookie": "a=1", "intervalMs": 800 })
        );
    }

    #[test]
    fn sync_inserts_missing_and_removes_orphaned_rows() {
        let db = memory_db();
        // 模拟一个已经从磁盘删掉的爬虫，仍然遗留着配置行。
        db.with_conn(|conn| repo::upsert(conn, ModuleId::Crawler, "does-not-exist-anymore", "{}"))
            .expect("seed orphaned row");

        let summary = sync(&db, ModuleId::Crawler).expect("sync should succeed");

        assert_eq!(summary.deleted, 1);
        // plugins/crawler 下真实有 6 个 manifest，跟 catalog::manifest_scanner 的测试用的是同一份数据。
        assert_eq!(summary.inserted, 6);

        let keys = db
            .with_conn(|conn| repo::list_keys(conn, ModuleId::Crawler))
            .expect("list keys");
        assert!(!keys.iter().any(|key| key == "does-not-exist-anymore"));
        assert!(keys.iter().any(|key| key == "mhxy-cbg"));
    }

    #[test]
    fn sync_is_idempotent() {
        let db = memory_db();
        sync(&db, ModuleId::Crawler).expect("first sync should succeed");

        let summary = sync(&db, ModuleId::Crawler).expect("second sync should succeed");

        assert_eq!(summary, SyncSummary::default());
    }
}
