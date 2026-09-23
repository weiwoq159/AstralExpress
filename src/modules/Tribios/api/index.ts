import type { Manifest } from "@/shared/domain/manifest";
import type { ManifestConfig } from "@/shared/domain/manifestConfig";
import type { CreateTaskResult, NewTask, Task, TaskActionKind } from "@/shared/domain/task";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils";

import { listTasksResponse, listToolsResponse } from "./commands.mock";

const MODULE_ID = "tools";

export const listTools = async (): Promise<Manifest[]> => {
  if (!isTauri()) {
    return Promise.resolve(listToolsResponse);
  }
  return invokeApiCommand<Manifest[]>("get_manifests", { moduleId: MODULE_ID });
};

export const listTasks = async (): Promise<Task[]> => {
  if (!isTauri()) {
    return Promise.resolve(listTasksResponse);
  }
  return invokeApiCommand<Task[]>("list_tasks", { moduleId: MODULE_ID });
};

export const createTask = async (task: NewTask): Promise<CreateTaskResult> => {
  if (!isTauri()) {
    throw new Error("仅桌面客户端支持创建任务");
  }
  return invokeApiCommand<CreateTaskResult>("create_task", { task });
};

export const updateTaskStatus = async (taskUid: string, action: TaskActionKind): Promise<Task> => {
  if (!isTauri()) {
    throw new Error("仅桌面客户端支持修改任务状态");
  }
  return invokeApiCommand<Task>("update_task_status", { taskUid, action });
};

/** 非 Tauri 环境下没有真实数据库，直接当作"还没配过"处理，不算错误。 */
export const getManifestConfig = async (manifestKey: string): Promise<ManifestConfig | null> => {
  if (!isTauri()) {
    return null;
  }
  return invokeApiCommand<ManifestConfig | null>("get_manifest_config", { moduleId: MODULE_ID, manifestKey });
};

export const setManifestConfig = async (
  manifestKey: string,
  config: Record<string, unknown>,
): Promise<ManifestConfig> => {
  if (!isTauri()) {
    throw new Error("仅桌面客户端支持保存配置");
  }
  return invokeApiCommand<ManifestConfig>("set_manifest_config", {
    config: { moduleId: MODULE_ID, manifestKey, config },
  });
};
