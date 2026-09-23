import { useCallback, useState } from "react";

import { App } from "antd";

import type { TaskAction } from "@/shared/config/task";
import type { Task, TaskActionKind } from "@/shared/domain/task";

type UseTaskActionsOptions = {
  updateTaskStatus: (taskUid: string, action: TaskActionKind) => Promise<Task>;
  /** 状态改完之后要做的事，通常是重新拉一遍任务列表。 */
  onUpdated: () => void | Promise<void>;
};

/**
 * 包一层 TaskQueue 的 onTaskAction：调用状态变更接口、给按钮转圈、失败了弹提示。
 * "view" 是纯前端概念（TaskQueue 自己处理打开详情弹窗），这里直接忽略。
 */
export const useTaskActions = ({ updateTaskStatus, onUpdated }: UseTaskActionsOptions) => {
  const { message } = App.useApp();
  const [updatingTaskUids, setUpdatingTaskUids] = useState<ReadonlySet<string>>(new Set());

  const onTaskAction = useCallback(
    async (task: Task, action: TaskAction) => {
      if (action === "view") return;

      setUpdatingTaskUids((prev) => new Set(prev).add(task.taskUid));
      try {
        await updateTaskStatus(task.taskUid, action);
        await onUpdated();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "操作失败");
      } finally {
        setUpdatingTaskUids((prev) => {
          const next = new Set(prev);
          next.delete(task.taskUid);
          return next;
        });
      }
    },
    [updateTaskStatus, onUpdated, message],
  );

  return { onTaskAction, updatingTaskUids };
};
