import { useQuery } from "@tanstack/react-query";

import { listTasks } from "@/shared/api/task";
import type { ModuleId } from "@/shared/domain/module";
import type { Task } from "@/shared/domain/task";

const EMPTY_TASKS: Task[] = [];
/** 存在未结束的任务时的轮询间隔，用于刷新进度。 */
const POLL_INTERVAL_MS = 2_000;

/** 读取某个模块的任务列表；有运行中或排队中的任务时自动轮询。 */
export const useTasks = (moduleId: ModuleId) => {
  const query = useQuery({
    queryKey: ["tasks", moduleId],
    queryFn: () => listTasks(moduleId),
    refetchInterval: (q) =>
      q.state.data?.some((task) => task.status === "running" || task.status === "pending") ? POLL_INTERVAL_MS : false,
  });
  return { ...query, tasks: query.data ?? EMPTY_TASKS };
};
