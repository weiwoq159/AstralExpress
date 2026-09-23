import { listen } from "@tauri-apps/api/event";

const TASK_CHANGED_EVENT = "task-changed";

type TaskChangedPayload = { taskUid: string };

/**
 * 订阅任务状态变化事件；每次收到就重新拉取任务列表，不尝试按 payload 增量合并——
 * 列表通常不大，重新拉一次比维护"服务端推了一条增量，怎么合并进本地状态"这套同步
 * 逻辑简单可靠得多。返回取消订阅函数，调用方在组件卸载时调用它。
 */
export const onTaskChanged = (handler: (payload: TaskChangedPayload) => void): (() => void) => {
  let disposed = false;
  let unlisten: (() => void) | undefined;

  void listen<TaskChangedPayload>(TASK_CHANGED_EVENT, (event) => handler(event.payload)).then((dispose) => {
    if (disposed) {
      dispose();
      return;
    }
    unlisten = dispose;
  });

  return () => {
    disposed = true;
    unlisten?.();
  };
};
