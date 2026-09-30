import { createTask as createModuleTask, listTasks as listModuleTasks } from "@/shared/api/plugins";

export { getTaskByUid } from "@/shared/api/plugins";

export const listTasks = (manifestKey?: string) => listModuleTasks("tools", manifestKey);

export const createTask = (manifestKey: string, params: Record<string, unknown> = {}) =>
  createModuleTask("tools", manifestKey, params);
