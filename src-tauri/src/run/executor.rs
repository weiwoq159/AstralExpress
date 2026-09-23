use crate::catalog;
use crate::database::state::DbState;
use crate::domain::task::Task;
use crate::run::db_writer;
use crate::run::downloader;
use crate::run::protocol::ExecutorMessage;
use crate::run::python;
use crate::task::events;
use crate::task::repo;
use serde_json::{Map, Value};
use std::path::Path;
use std::process::Stdio;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::process::{ChildStderr, ChildStdout, Command};

/// 调度器派发一个任务时调用：从 running 到 success/failed 的整个生命周期都在这里落盘，
/// 调用方（调度器）不需要关心中间状态。
pub async fn run(app: &AppHandle, task: Task) {
    {
        let db = app.state::<DbState>();
        if let Err(error) = db.with_conn(|conn| repo::mark_running(conn, &task.task_uid)) {
            log::error!("任务 {} 标记 running 失败：{error}", task.task_uid);
            return;
        }
    }
    events::emit_task_changed(app, &task.task_uid);
    log::info!(
        "任务 {} 开始执行：{}/{}",
        task.task_uid,
        task.module_id.as_str(),
        task.manifest_key
    );

    let outcome = execute_process(app, &task).await;

    let db = app.state::<DbState>();
    let write_result = match &outcome {
        Ok(result) => {
            db.with_conn(|conn| repo::mark_success(conn, &task.task_uid, &result.to_string()))
        }
        Err(message) => db.with_conn(|conn| repo::mark_failed(conn, &task.task_uid, message)),
    };
    if let Err(error) = write_result {
        log::error!("任务 {} 写入执行结果失败：{error}", task.task_uid);
    } else {
        events::emit_task_changed(app, &task.task_uid);
    }

    match outcome {
        Ok(_) => log::info!("任务 {} 执行成功", task.task_uid),
        Err(message) => log::warn!("任务 {} 执行失败：{message}", task.task_uid),
    }
}

/// stdout 上收到的终态消息——`success`/`failed` 都是终态，以最后一条为准。
enum Outcome {
    Success(Value),
    Failed(String),
}

/// 拉起 Python 子进程、喂参数、把 stdout/stderr 读完，返回最终结果或失败原因。
/// 不在这里写数据库终态——由调用方 `run` 统一落盘，这里只负责"跑完一个任务"这一件事。
async fn execute_process(app: &AppHandle, task: &Task) -> Result<Value, String> {
    let interpreter = python::interpreter_path()?;
    let manifest = catalog::find(task.module_id, &task.manifest_key)
        .map_err(|error| error.to_string())?
        .ok_or_else(|| format!("manifest {} 不存在", task.manifest_key))?;
    let script = python::entry_script_path(task.module_id, &task.manifest_key, &manifest.entry)?;

    let request = serde_json::json!({
        "method": "execute",
        "payload": serde_json::from_str::<Value>(&task.params_json).unwrap_or(Value::Null),
    });

    // stdout 按 UTF-8 逐行解析。不设编码时，Windows 管道上的 Python 用 ANSI 代码页
    // （中文系统是 GBK），中文 JSON 会让下面的 lines() 报 "stream did not contain valid UTF-8"。
    let mut child = Command::new(&interpreter)
        .arg(&script)
        .current_dir(script.parent().unwrap_or_else(|| Path::new(".")))
        .env("PYTHONUTF8", "1")
        .env("PYTHONIOENCODING", "utf-8")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("启动 Python 进程失败：{error}"))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(request.to_string().as_bytes())
            .await
            .map_err(|error| format!("写入任务参数失败：{error}"))?;
        // stdin 在这里随作用域结束被 drop，关闭管道，脚本的 json.load(sys.stdin) 才会返回。
    }

    let stdout = child
        .stdout
        .take()
        .expect("stdout 已通过 Stdio::piped 配置");
    let stderr = child
        .stderr
        .take()
        .expect("stderr 已通过 Stdio::piped 配置");

    // stdout 和 stderr 必须并发读：只读一边的话，另一边系统管道缓冲区写满会把子进程卡死。
    let (outcome, stderr_text) = tokio::join!(
        read_stdout(app, &task.task_uid, stdout),
        read_stderr(stderr)
    );
    let outcome = outcome?;

    let status = child
        .wait()
        .await
        .map_err(|error| format!("等待 Python 进程退出失败：{error}"))?;

    // 脚本输出过 success/failed 终态消息的话，以它为准——不管退出码是什么。
    // 只有从头到尾没输出过任何终态消息（比如中途崩溃）时，才用退出码/stderr 兜底。
    match outcome {
        Some(Outcome::Success(data)) => Ok(data),
        Some(Outcome::Failed(message)) => Err(message),
        None if !status.success() => {
            let stderr_text = stderr_text.trim();
            Err(if stderr_text.is_empty() {
                format!("Python 进程退出码 {}", status.code().unwrap_or(-1))
            } else {
                stderr_text.to_string()
            })
        }
        None => Err("脚本未输出结果".to_string()),
    }
}

/// 按行读 stdout，按消息类型分发：
/// - process 落盘更新进度
/// - download 交给 downloader 实际发请求下载（下载失败只记警告，不中断整个任务）
/// - db_insert 走白名单校验后写库（失败同样只记警告）
/// - success/failed（或旧协议下没有 type 字段的裸 JSON 行，按 success 处理）记为终态，
///   以最后一条终态消息为准——脚本中途改主意重新汇报一次是允许的
///
/// download/db_insert 都是同步 await 完再继续读下一行——脚本产出这些指令的速度远比不上
/// 网络 IO，串行处理足够，没必要为并发下载/写库再引入额外的任务调度复杂度。
async fn read_stdout(
    app: &AppHandle,
    task_uid: &str,
    stdout: ChildStdout,
) -> Result<Option<Outcome>, String> {
    let mut lines = BufReader::new(stdout).lines();
    let mut outcome = None;
    while let Some(line) = lines
        .next_line()
        .await
        .map_err(|error| format!("读取脚本输出失败：{error}"))?
    {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match ExecutorMessage::parse(trimmed) {
            Some(ExecutorMessage::Process {
                current_index,
                total,
            }) => apply_progress(app, task_uid, current_index, total),
            Some(ExecutorMessage::Download {
                download_url,
                download_path,
                download_name,
            }) => {
                if let Err(error) =
                    downloader::download_file(&download_url, &download_path, &download_name).await
                {
                    log::warn!("任务 {task_uid} 下载失败（{download_url}）：{error}");
                }
            }
            Some(ExecutorMessage::DbInsert { table_name, value }) => {
                apply_db_write(app, task_uid, &table_name, &value)
            }
            Some(ExecutorMessage::Success { message, data }) => {
                if let Some(message) = &message {
                    log::info!("任务 {task_uid} 报告完成：{message}");
                }
                outcome = Some(Outcome::Success(
                    data.unwrap_or_else(|| serde_json::json!({ "message": message })),
                ));
            }
            Some(ExecutorMessage::Failed { message }) => {
                log::warn!("任务 {task_uid} 报告失败：{message}");
                outcome = Some(Outcome::Failed(message));
            }
            Some(ExecutorMessage::LegacyResult(value)) => outcome = Some(Outcome::Success(value)),
            None => log::warn!("任务 {task_uid} 忽略无法解析的输出行：{trimmed}"),
        }
    }
    Ok(outcome)
}

async fn read_stderr(stderr: ChildStderr) -> String {
    let mut buffer = String::new();
    let _ = BufReader::new(stderr).read_to_string(&mut buffer).await;
    buffer
}

fn apply_progress(app: &AppHandle, task_uid: &str, current_index: Option<i64>, total: Option<i64>) {
    let progress = match (current_index, total) {
        (Some(done), Some(total)) if total > 0 => Some(
            ((done as f64 / total as f64) * 100.0)
                .round()
                .clamp(0.0, 100.0) as u8,
        ),
        _ => None,
    };
    let db = app.state::<DbState>();
    if let Err(error) =
        db.with_conn(|conn| repo::update_progress(conn, task_uid, current_index, total, progress))
    {
        log::warn!("任务 {task_uid} 更新进度失败：{error}");
        return;
    }
    events::emit_progress_changed(app, task_uid);
}

fn apply_db_write(app: &AppHandle, task_uid: &str, table: &str, value: &Map<String, Value>) {
    let outcome: Result<(), String> =
        db_writer::build_insert(table, value).and_then(|(sql, bound)| {
            let db = app.state::<DbState>();
            let params: Vec<&dyn rusqlite::ToSql> = bound
                .iter()
                .map(|value| value as &dyn rusqlite::ToSql)
                .collect();
            db.with_conn(|conn| conn.execute(&sql, rusqlite::params_from_iter(params)))
                .map(|_| ())
                .map_err(|error| error.to_string())
        });
    if let Err(error) = outcome {
        log::warn!("任务 {task_uid} 写入表 {table} 失败：{error}");
    }
}
