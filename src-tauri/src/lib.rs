mod catalog;
mod cbg;
mod commands;
mod database;
mod domain;
mod manifest_config;
mod platform;
mod run;
mod task;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = platform::paths::database_path().expect("无法确定数据库路径");
    let db = database::state::DbState::new(db_path).expect("数据库初始化失败");

    tauri::Builder::default()
        .manage(db)
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 让 crawler 的配置表跟 plugins/crawler 下实际扫描到的 manifest 保持一一对应：
            // 新插件补一条空配置，删掉的插件把遗留配置清掉。只在启动时跑一次。
            let db_state = app.state::<database::state::DbState>();
            match manifest_config::service::sync(&db_state, domain::module::ModuleId::Crawler) {
                Ok(summary) => {
                    log::info!(
                        "crawler 配置表同步完成：新增 {} 条，清理 {} 条",
                        summary.inserted,
                        summary.deleted
                    );
                }
                Err(error) => log::warn!("crawler 配置表同步失败：{error}"),
            }

            // 崩溃恢复：上次退出前还处于 running 的任务不可能有进程真的在跑，统一标记为 interrupted。
            match db_state.with_conn(|conn| task::repo::mark_orphaned_running_as_interrupted(conn))
            {
                Ok(0) => {}
                Ok(count) => {
                    log::warn!("启动时发现 {count} 个遗留的 running 任务，已标记为 interrupted")
                }
                Err(error) => log::warn!("清理遗留 running 任务失败：{error}"),
            }

            run::scheduler::spawn(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::catalog::get_manifests,
            commands::manifest_config::get_manifest_config,
            commands::manifest_config::set_manifest_config,
            commands::task::create_task,
            commands::task::get_task_by_uid,
            commands::task::list_tasks,
            commands::task::update_task_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
