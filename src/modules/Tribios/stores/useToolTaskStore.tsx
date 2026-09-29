import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Task } from "@/shared/domain/task";

import { listTasks } from "@tribios/api/task";

type ToolTaskStore = {
  tasks: Task[];
  loading: boolean;
  hasLoaded: boolean;
  fetchTasks: () => Promise<Task[]>;
};

export const useToolTaskStore = create<ToolTaskStore>()(
  persist(
    (set) => {
      let pendingRequest: Promise<Task[]> | undefined;

      return {
        tasks: [],
        loading: false,
        hasLoaded: false,
        fetchTasks: () => {
          // StrictMode 或多个组件同时加载时，共用正在进行的请求。
          if (pendingRequest) return pendingRequest;

          set({ loading: true });
          pendingRequest = listTasks()
            .then((tasks) => {
              set({ tasks, hasLoaded: true });
              return tasks;
            })
            .finally(() => {
              pendingRequest = undefined;
              set({ loading: false });
            });

          return pendingRequest;
        },
      };
    },
    {
      name: "astral-express:tribios:tasks",
      // 刷新时先恢复当前窗口的列表，再由页面重新加载最新清单。
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
