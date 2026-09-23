use crate::domain::module::ModuleId;
use crate::platform::paths;
use std::path::PathBuf;

/// 所有任务都跑在同一个项目内置的虚拟环境里，不依赖用户机器上的系统 Python。
pub fn interpreter_path() -> Result<PathBuf, String> {
    let path = paths::workspace_dir()?
        .join("runtime")
        .join("core-venv")
        .join("Scripts")
        .join("python.exe");
    if !path.is_file() {
        return Err(format!("找不到 Python 解释器：{}", path.display()));
    }
    Ok(path)
}

/// manifest.entry 是相对插件目录（plugins/<module_id>/<manifest_key>/）的文件名，如 "main.py"。
pub fn entry_script_path(
    module_id: ModuleId,
    manifest_key: &str,
    entry: &str,
) -> Result<PathBuf, String> {
    let path = paths::plugin_dir(module_id)?.join(manifest_key).join(entry);
    if !path.is_file() {
        return Err(format!("找不到插件入口脚本：{}", path.display()));
    }
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entry_script_path_resolves_real_batch_rename_entry() {
        let path =
            entry_script_path(ModuleId::Tools, "batch-rename", "main.py").expect("should resolve");
        assert!(
            path.ends_with("plugins/tools/batch-rename/main.py")
                || path.ends_with("plugins\\tools\\batch-rename\\main.py")
        );
    }

    #[test]
    fn entry_script_path_rejects_missing_entry() {
        let error = entry_script_path(ModuleId::Tools, "batch-rename", "does-not-exist.py")
            .expect_err("should fail");
        assert!(error.contains("找不到插件入口脚本"));
    }
}
