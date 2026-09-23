use crate::database::state::DbState;
use crate::run::executor;
use crate::task::repo;
use std::time::Duration;
use tauri::{AppHandle, Manager};

/// 串行执行引擎：队列空了才睡一会儿，新任务最多等这么久才会被捡起来跑。
const IDLE_POLL_INTERVAL: Duration = Duration::from_millis(800);
const ERROR_RETRY_INTERVAL: Duration = Duration::from_secs(2);

/// 启动调度器后台循环，随应用进程常驻。一次只派一个任务（串行执行），跑完立刻去捞
/// 下一条 pending，避免多个 Python 进程同时抢同一份 manifest 配置（cookie/代理等）。
pub fn spawn(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let next = {
                let db = app.state::<DbState>();
                db.with_conn(repo::next_pending)
            };
            match next {
                Ok(Some(task)) => executor::run(&app, task).await,
                Ok(None) => tokio::time::sleep(IDLE_POLL_INTERVAL).await,
                Err(error) => {
                    log::error!("调度器查询待执行任务失败：{error}");
                    tokio::time::sleep(ERROR_RETRY_INTERVAL).await;
                }
            }
        }
    });
}
