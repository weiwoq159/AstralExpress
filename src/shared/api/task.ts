import type { ModuleId } from "@/shared/domain/module";
import type { Task } from "@/shared/domain/task";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

export const listTasks = async (moduleId: ModuleId): Promise<Task[]> => {
  if (!isTauri()) return [];
  return invokeApiCommand<Task[]>("list_tasks", { moduleId });
};
