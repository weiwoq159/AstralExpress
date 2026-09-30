import { useStore, type StoreApi } from "zustand";

import type { TaskStore } from "@/shared/stores/createTaskStore";

export const useTaskQueue = (store: StoreApi<TaskStore>) => ({
  tasks: useStore(store, (state) => state.items),
  loading: useStore(store, (state) => state.loading),
  error: useStore(store, (state) => state.error),
  actionError: useStore(store, (state) => state.actionError),
  onTaskAction: useStore(store, (state) => state.applyAction),
  updatingTaskUids: useStore(store, (state) => state.updatingTaskUids),
});
