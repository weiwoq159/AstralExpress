import { create, type StoreApi, type UseBoundStore } from "zustand";

export type AsyncListState<Item> = {
  items: Item[];
  error?: string;
  loading: boolean;
  hasLoaded: boolean;
  load: () => Promise<void>;
};

type CreateAsyncListStoreOptions<Item> = { fetchItems: () => Promise<Item[]>; fallbackErrorMessage: string };

export const createAsyncListStore = <Item>({
  fetchItems,
  fallbackErrorMessage,
}: CreateAsyncListStoreOptions<Item>): UseBoundStore<StoreApi<AsyncListState<Item>>> =>
  create<AsyncListState<Item>>((set, get) => ({
    items: [],
    error: undefined,
    loading: false,
    hasLoaded: false,
    load: async () => {
      if (get().loading) return;
      set({ loading: true, error: undefined });
      try {
        const items = await fetchItems();
        set({ items, error: undefined });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : fallbackErrorMessage });
      } finally {
        set({ loading: false, hasLoaded: true });
      }
    },
  }));
