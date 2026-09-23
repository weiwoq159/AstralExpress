use crate::domain::module::ModuleId;
use std::path::PathBuf;

pub fn workspace_dir() -> Result<PathBuf, String> {
    if cfg!(debug_assertions) {
        // 开发：仓库根目录
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .map(PathBuf::from)
            .ok_or_else(|| "无法从 src-tauri 目录解析工作区根目录".to_string())
    } else {
        // 发布：exe 所在目录
        std::env::current_exe()
            .map_err(|e| format!("无法获取可执行文件路径: {e}"))?
            .parent()
            .map(PathBuf::from)
            .ok_or_else(|| "无法解析可执行文件所在目录".to_string())
    }
}

pub fn plugin_dir(module_id: ModuleId) -> Result<PathBuf, String> {
    Ok(workspace_dir()?.join("plugins").join(module_id.as_str()))
}

/// 用户数据目录：`%APPDATA%\AstralExpress`（如 `C:\Users\<user>\AppData\Roaming\AstralExpress`）。
/// 跟 `workspace_dir()` 分开——插件是随仓库/安装目录走的静态资源，数据库是用户数据，不该混在一起，
/// 也不该随开发目录或安装目录变化。
pub fn data_dir() -> Result<PathBuf, String> {
    let appdata =
        std::env::var("APPDATA").map_err(|e| format!("无法读取 APPDATA 环境变量: {e}"))?;
    let dir = PathBuf::from(appdata).join("AstralExpress");
    std::fs::create_dir_all(&dir).map_err(|e| format!("无法创建数据目录: {e}"))?;
    Ok(dir)
}

pub fn database_path() -> Result<PathBuf, String> {
    Ok(data_dir()?.join("AstralExpress.db"))
}
