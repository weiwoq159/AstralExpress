import dayjs from "dayjs";

import type { TaskActionKind, TaskStatus } from "@/shared/domain/task";

/** view 只打开前端详情，其余动作由调用方处理。 */
export type TaskAction = TaskActionKind | "view";

type TaskTone = "completed" | "failed" | "queued" | "running";

type TaskPresentation = {
  label: string;
  stage: string;
  tone: TaskTone;
  actions: readonly { action: TaskAction; label: string }[];
};

export const taskStatusPresentation: Record<TaskStatus, TaskPresentation> = {
  pending: {
    label: "排队中",
    stage: "等待调度",
    tone: "queued",
    actions: [
      { action: "cancel", label: "取消" },
      { action: "pause", label: "暂停" },
    ],
  },
  running: {
    label: "运行中",
    stage: "执行中",
    tone: "running",
    actions: [{ action: "view", label: "查看详情" }],
  },
  paused: {
    label: "已暂停",
    stage: "已暂停",
    tone: "queued",
    actions: [
      { action: "resume", label: "继续" },
      { action: "restart", label: "重新开始" },
    ],
  },
  success: {
    label: "已完成",
    stage: "已完成",
    tone: "completed",
    actions: [{ action: "view", label: "查看结果" }],
  },
  failed: {
    label: "失败",
    stage: "已中断",
    tone: "failed",
    actions: [{ action: "retry", label: "重试" }],
  },
  canceled: {
    label: "已取消",
    stage: "已取消",
    tone: "completed",
    actions: [{ action: "retry", label: "重试" }],
  },
  interrupted: {
    label: "已中断",
    stage: "已中断",
    tone: "failed",
    actions: [{ action: "retry", label: "重试" }],
  },
};

export const formatTaskTime = (value?: string | null): string => {
  if (!value) return "—";
  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : value;
};
