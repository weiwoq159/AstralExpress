import type { Manifest } from "@/shared/domain/manifest";
import type { ModuleId } from "@/shared/domain/module";
import type { CreateTaskResult, NewTask, Task, TaskActionKind } from "@/shared/domain/task";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

export const listManifests = async (moduleId: ModuleId): Promise<Manifest[]> => {
  if (!isTauri()) return [];
  return invokeApiCommand<Manifest[]>("get_manifests", { moduleId });
};

export const listTasks = async (moduleId: ModuleId, manifestKey?: string): Promise<Task[]> => {
  if (!isTauri()) return [];
  return invokeApiCommand<Task[]>("list_tasks", { moduleId, manifestKey });
};

export const getTaskByUid = async (taskUid: string): Promise<Task | null> => {
  if (!isTauri()) return null;
  return invokeApiCommand<Task | null>("get_task_by_uid", { taskUid });
};

export const applyTaskAction = async (
  moduleId: ModuleId,
  taskUid: string,
  action: TaskActionKind,
): Promise<Task> => {
  if (!isTauri()) throw new Error("任务操作仅在 Tauri 环境下可用");
  return invokeApiCommand<Task>("apply_task_action", { moduleId, taskUid, action });
};

export const createTask = async (
  moduleId: ModuleId,
  manifestKey: string,
  params: Record<string, unknown> = {},
): Promise<CreateTaskResult> => {
  if (!isTauri()) throw new Error("createTask 仅在 Tauri 环境下可用");
  const task: NewTask = { moduleId, manifestKey, params };
  return invokeApiCommand<CreateTaskResult>("create_task", { task });
};
