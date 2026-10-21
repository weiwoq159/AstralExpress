use crate::domain::module::ModuleId;
use std::path::PathBuf;

/// 获取项目工作区根目录。
///
/// Debug 模式：返回 Cargo.toml 所在目录的父目录。
/// Release 模式：返回当前可执行文件所在目录。
///
/// # Errors
/// 无法解析父目录或获取可执行文件路径时返回错误。
#[cfg(debug_assertions)]
pub fn workspace_dir() -> Result<PathBuf, String> {
    // 编译时获取当前 crate 的 Cargo.toml 所在目录
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .map(PathBuf::from)
        .ok_or_else(|| "无法从 src-tauri 目录解析工作区根目录".to_string())
}

/// 获取项目工作区根目录。
///
/// Debug 模式：返回 Cargo.toml 所在目录的父目录。
/// Release 模式：返回当前可执行文件所在目录。
///
/// # Errors
/// 无法解析父目录或获取可执行文件路径时返回错误。
#[cfg(not(debug_assertions))]
pub fn workspace_dir() -> Result<PathBuf, String> {
    // 获取当前可执行文件路径，并提取其所在目录
    std::env::current_exe()
        .map_err(|e| format!("无法获取可执行文件路径: {e}"))?
        .parent()
        .map(PathBuf::from)
        .ok_or_else(|| "无法解析可执行文件所在目录".to_string())
}

/// 获取指定模块的插件目录。
///
/// 目录结构：`<workspace>/plugins/<module_id>`
///
/// # Arguments
/// * `module_id` - 模块标识，用于确定插件子目录。
///
/// # Errors
/// 无法获取工作区根目录时返回错误。
pub fn plugin_dir(module_id: ModuleId) -> Result<PathBuf, String> {
    Ok(workspace_dir()?.join("plugins").join(module_id.as_str()))
}

/// 获取 Python 虚拟环境中的解释器路径。
///
/// Windows：`runtime/core-venv/Scripts/python.exe`
/// macOS/Linux：`runtime/core-venv/bin/python`
///
/// # Errors
/// 无法获取工作区根目录或解释器文件不存在时返回错误。
pub fn python_path() -> Result<PathBuf, String> {
    let environment = workspace_dir()?.join("runtime").join("core-venv");

    // 根据目标操作系统选择 Python 解释器路径
    #[cfg(target_os = "windows")]
    let interpreter = environment.join("Scripts").join("python.exe");

    #[cfg(not(target_os = "windows"))]
    let interpreter = environment.join("bin").join("python");

    // 确认解释器文件存在
    if !interpreter.is_file() {
        return Err(format!("找不到 Python 解释器：{}", interpreter.display()));
    }

    Ok(interpreter)
}

/// 获取应用数据目录，不存在时自动创建。
///
/// Windows 目录：`%APPDATA%/AstralExpress`
///
/// # Errors
/// APPDATA 环境变量不存在或目录创建失败时返回错误。
pub fn data_dir() -> Result<PathBuf, String> {
    // 获取 Windows 用户的应用数据目录
    let appdata =
        std::env::var("APPDATA").map_err(|e| format!("无法读取 APPDATA 环境变量: {e}"))?;

    let dir = PathBuf::from(appdata).join("AstralExpress");

    // 递归创建目录，目录已存在时不会报错
    std::fs::create_dir_all(&dir).map_err(|e| format!("无法创建数据目录: {e}"))?;

    Ok(dir)
}

/// 获取应用 SQLite 数据库文件路径。
///
/// 数据库位置：`<data_dir>/AstralExpress.db`
///
/// 仅返回文件路径，不负责创建或初始化数据库。
///
/// # Errors
/// 无法获取或创建应用数据目录时返回错误。
pub fn database_path() -> Result<PathBuf, String> {
    Ok(data_dir()?.join("AstralExpress.db"))
}
