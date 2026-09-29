import type { CreateTaskResult, NewTask, Task } from "@/shared/domain/task";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

const MODULE_ID = "tools";

export const listTasks = async (manifestKey?: string): Promise<Task[]> => {
  if (!isTauri()) {
    return Promise.resolve([]);
  }
  return invokeApiCommand<Task[]>("list_tasks", { moduleId: MODULE_ID, manifestKey });
};

export const getTaskByUid = async (taskUid: string): Promise<Task | null> => {
  if (!isTauri()) {
    return Promise.resolve(null);
  }
  return invokeApiCommand<Task | null>("get_task_by_uid", { taskUid });
};

export const createTask = async (
  manifestKey: string,
  params: Record<string, unknown> = {},
): Promise<CreateTaskResult> => {
  if (!isTauri()) {
    return Promise.reject(new Error("createTask 仅在 Tauri 环境下可用"));
  }
  const task: NewTask = { moduleId: MODULE_ID, manifestKey, params };
  return invokeApiCommand<CreateTaskResult>("create_task", { task });
};
