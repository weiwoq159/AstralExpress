mod catalog;
mod commands;
mod database;
mod domain;
mod platform;
mod task;
mod weather;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = platform::paths::database_path().expect("无法确定数据库路径");
    let db = database::state::DbState::new(db_path).expect("数据库初始化失败");
    tauri::Builder::default()
        .manage(db)
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::weather::fetch_weather,
            commands::catalog::get_manifests,
            commands::task::create_task,
            commands::task::get_task_by_uid,
            commands::task::list_tasks,
            commands::task::apply_task_action
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
