import type { Task } from "@/shared/domain/task";
import { createAsyncListStore } from "@/shared/hooks/createAsyncListStore";

import { listTasks } from "../api";

export const useTaskStore = createAsyncListStore<Task>({
  fetchItems: listTasks,
  fallbackErrorMessage: "任务队列读取失败",
});
