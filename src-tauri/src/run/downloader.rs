use std::path::{Path, PathBuf};

/// 校验 filename 不带路径分隔符/上级目录，拼出最终落盘路径。爬虫脚本的 download_name 经常
/// 直接来自抓取到的网页内容，不做这道校验的话，一个精心构造的文件名就能跳出 download_path。
fn resolve_target_path(dir: &str, filename: &str) -> Result<PathBuf, String> {
    let filename_path = Path::new(filename);
    if filename_path.file_name() != Some(filename_path.as_os_str()) {
        return Err(format!("非法的下载文件名：{filename}"));
    }
    Ok(Path::new(dir).join(filename_path))
}

/// 实际发 HTTP 请求把文件下载到本地——插件脚本只负责发现 URL 和目标路径，不自己下载。
pub async fn download_file(url: &str, dir: &str, filename: &str) -> Result<PathBuf, String> {
    let target = resolve_target_path(dir, filename)?;

    tokio::fs::create_dir_all(dir)
        .await
        .map_err(|error| format!("创建下载目录失败：{error}"))?;

    let response = reqwest::get(url)
        .await
        .map_err(|error| format!("下载请求失败：{error}"))?;
    if !response.status().is_success() {
        return Err(format!("下载失败，HTTP 状态码 {}", response.status()));
    }
    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("读取下载内容失败：{error}"))?;

    tokio::fs::write(&target, &bytes)
        .await
        .map_err(|error| format!("写入文件失败：{error}"))?;
    Ok(target)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_target_path_joins_dir_and_filename() {
        let path = resolve_target_path("/path/to/download", "a.png").expect("should resolve");
        assert_eq!(path, Path::new("/path/to/download").join("a.png"));
    }

    #[test]
    fn resolve_target_path_rejects_path_traversal() {
        assert!(resolve_target_path("/path/to/download", "../../evil.exe").is_err());
        assert!(resolve_target_path("/path/to/download", "sub/dir/a.png").is_err());
        assert!(resolve_target_path("/path/to/download", "..").is_err());
    }
}
