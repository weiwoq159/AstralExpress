use serde::Serialize;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

/// 前端订阅这一个事件就够了：收到后统一重新拉取任务列表，不需要精确知道具体是哪个
/// 任务变了、变成了什么——这样前端只用维护"整份列表"这一份状态，不用额外处理"服务端
/// 推了一条增量，怎么合并进本地列表"这类同步逻辑。
pub const TASK_CHANGED_EVENT: &str = "task-changed";

#[derive(Debug, Clone, Serialize)]
pub struct TaskChanged {
    pub task_uid: String,
}

pub fn emit_task_changed(app: &AppHandle, task_uid: &str) {
    let _ = app.emit(
        TASK_CHANGED_EVENT,
        TaskChanged {
            task_uid: task_uid.to_string(),
        },
    );
}

const PROGRESS_EMIT_INTERVAL: Duration = Duration::from_millis(300);
static LAST_PROGRESS_EMIT: Mutex<Option<Instant>> = Mutex::new(None);

/// 进度汇报可能非常密集（比如批量处理上千个文件，一个文件一条 process 消息），逐条转发
/// 给前端会让它跟着高频重新拉取整个任务列表。按固定间隔节流，只保留"看起来实时"的效果——
/// 执行引擎本来就是串行的（同一时刻只有一个任务在跑），一个全局节流阀就够，不需要按
/// task_uid 分别节流。
pub fn emit_progress_changed(app: &AppHandle, task_uid: &str) {
    let mut last = LAST_PROGRESS_EMIT.lock().expect("lock 未中毒");
    let now = Instant::now();
    let should_emit = match *last {
        Some(instant) => now.duration_since(instant) >= PROGRESS_EMIT_INTERVAL,
        None => true,
    };
    if should_emit {
        *last = Some(now);
        emit_task_changed(app, task_uid);
    }
}
