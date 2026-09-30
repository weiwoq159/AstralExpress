import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { applyTaskAction, listTasks } from "@/shared/api/plugins";
import type { ModuleId } from "@/shared/domain/module";
import type { Task, TaskActionKind } from "@/shared/domain/task";

import type { ListStore } from "./createListStore";

export type TaskStore = ListStore<Task> & {
  actionError: string | null;
  updatingTaskUids: ReadonlySet<string>;
  applyAction: (task: Task, action: TaskActionKind) => Promise<void>;
};

/** 每个模块独立保存请求状态；任务页和首页共用同一份队列。 */
export const createTaskStore = (moduleId: ModuleId) =>
  create<TaskStore>()(
    persist(
      (set, get) => {
        let pendingRequest: Promise<Task[]> | undefined;
        let revision = 0;
        const taskRevisions = new Map<string, number>();

        return {
          items: [],
          loading: false,
          hasLoaded: false,
          error: null,
          actionError: null,
          updatingTaskUids: new Set<string>(),
          fetchItems: () => {
            if (pendingRequest) return pendingRequest;
            const requestedAt = revision;
            pendingRequest = Promise.resolve()
              .then(() => listTasks(moduleId))
              .then((items) => {
                // 列表请求发出后可能已完成操作，旧查询不能覆盖操作返回的新状态。
                const current = new Map(get().items.map((task) => [task.taskUid, task]));
                const merged = items.map((task) =>
                  (taskRevisions.get(task.taskUid) ?? 0) > requestedAt
                    ? (current.get(task.taskUid) ?? task)
                    : task,
                );
                set({ items: merged, hasLoaded: true, error: null });
                return merged;
              })
              .catch((error: unknown) => {
                set({ error: error instanceof Error ? error.message : String(error) });
                throw error;
              })
              .finally(() => {
                pendingRequest = undefined;
                set({ loading: false });
              });
            set({ loading: true, error: null });
            return pendingRequest;
          },
          applyAction: async (task, action) => {
            if (get().updatingTaskUids.has(task.taskUid)) return;
            if (task.moduleId !== moduleId) {
              set({ actionError: "任务不属于当前模块" });
              return;
            }
            set((state) => ({
              actionError: null,
              updatingTaskUids: new Set(state.updatingTaskUids).add(task.taskUid),
            }));
            try {
              const updated = await applyTaskAction(moduleId, task.taskUid, action);
              taskRevisions.set(task.taskUid, ++revision);
              set((state) => ({
                items: state.items.map((item) => (item.taskUid === updated.taskUid ? updated : item)),
              }));
            } catch (error) {
              set({ actionError: error instanceof Error ? error.message : String(error) });
              // 状态可能已被其他入口改变，失败时重新读取，但保留操作错误。
              await get().fetchItems().catch(() => undefined);
            } finally {
              set((state) => {
                const updatingTaskUids = new Set(state.updatingTaskUids);
                updatingTaskUids.delete(task.taskUid);
                return { updatingTaskUids };
              });
            }
          },
        };
      },
      {
        name: `astral-express:${moduleId}:tasks`,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ items: state.items }),
      },
    ),
  );
