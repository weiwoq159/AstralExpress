import dayjs from "dayjs";

import type { TaskActionKind, TaskStatus } from "@/shared/domain/task";

/** "view" 纯前端概念（打开详情弹窗），不需要后端参与，不在 TaskActionKind 里。 */
export type TaskAction = TaskActionKind | "view";
type TaskTone = "completed" | "failed" | "queued" | "running";

type TaskActionPresentation = {
  action: TaskAction;
  actionLabel: string;
};

type TaskPresentation = {
  actions: TaskActionPresentation[];
  label: string;
  stage: string;
  tone: TaskTone;
};

export const taskStatusPresentation: Record<TaskStatus, TaskPresentation> = {
  canceled: {
    actions: [{ action: "retry", actionLabel: "重试" }],
    label: "已取消",
    stage: "已取消",
    tone: "completed",
  },
  failed: {
    actions: [{ action: "retry", actionLabel: "重试" }],
    label: "失败",
    stage: "已中断",
    tone: "failed",
  },
  paused: {
    actions: [
      { action: "resume", actionLabel: "继续" },
      { action: "restart", actionLabel: "重新开始" },
    ],
    label: "已暂停",
    stage: "已暂停",
    tone: "queued",
  },
  pending: {
    actions: [
      { action: "cancel", actionLabel: "取消" },
      { action: "pause", actionLabel: "暂停" },
    ],
    label: "排队中",
    stage: "等待调度",
    tone: "queued",
  },
  running: {
    actions: [{ action: "view", actionLabel: "查看" }],
    label: "运行中",
    stage: "执行中",
    tone: "running",
  },
  success: {
    actions: [{ action: "view", actionLabel: "查看结果" }],
    label: "已完成",
    stage: "已完成",
    tone: "completed",
  },
  interrupted: {
    actions: [{ action: "retry", actionLabel: "重试" }],
    label: "已中断",
    stage: "已中断",
    tone: "failed",
  },
};

export const formatTaskTime = (value?: string | null): string => {
  if (!value) return "—";
  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : value;
};
