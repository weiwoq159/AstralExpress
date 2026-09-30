import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ListStore<T> = {
  items: T[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchItems: () => Promise<T[]>;
};

type ListStoreOptions<T> = {
  storageKey: string;
  load: () => Promise<T[]>;
};

/** 共用列表加载逻辑；每次调用创建独立的状态、缓存和进行中的请求。 */
export const createListStore = <T>({ storageKey, load }: ListStoreOptions<T>) =>
  create<ListStore<T>>()(
    persist(
      (set) => {
        let pendingRequest: Promise<T[]> | undefined;

        return {
          items: [],
          loading: false,
          hasLoaded: false,
          error: null,
          fetchItems: () => {
            if (pendingRequest) return pendingRequest;

            // 延迟执行 load，让同步抛错也走统一的错误处理，并先保存请求供其他调用复用。
            pendingRequest = Promise.resolve()
              .then(load)
              .then((items) => {
                set({ items, hasLoaded: true, error: null });
                return items;
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
        };
      },
      {
        name: storageKey,
        storage: createJSONStorage(() => sessionStorage),
        // 只缓存数据，刷新后的请求状态由本次加载决定。
        partialize: (state) => ({ items: state.items }),
      },
    ),
  );
