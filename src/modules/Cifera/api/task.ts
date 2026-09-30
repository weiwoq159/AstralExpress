import { createTask as createModuleTask, listTasks as listModuleTasks } from "@/shared/api/plugins";

export { getTaskByUid } from "@/shared/api/plugins";

export const listTasks = (manifestKey?: string) => listModuleTasks("crawler", manifestKey);

export const createTask = (manifestKey: string, params: Record<string, unknown> = {}) =>
  createModuleTask("crawler", manifestKey, params);
