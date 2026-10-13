mod catalog;
mod commands;
mod domain;
mod platform;
mod tray;
mod weather;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            tray::init::init(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::weather::fetch_weather,
            commands::catalog::list_manifests,
            commands::catalog::read_manifest
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
