import { useCallback, useEffect, useState } from "react";

import type { Item } from "@/modules/Aglaea/domain/items/Item";

import { fetchItems } from "../api/items";

export interface UseItemsResult {
  items: Item[];
  loading: boolean;
  error: string | null;
  /** 重新读取；不会让列表回到加载状态，避免新增后闪一下骨架屏。 */
  reload: () => void;
}

type ItemsState = Omit<UseItemsResult, "reload">;

/** 读取全部道具；页面直接过滤，不再回后端查询。 */
export const useItems = (): UseItemsResult => {
  const [state, setState] = useState<ItemsState>({ items: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetchItems()
      .then((items) => {
        if (!cancelled) setState({ items, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ items: [], loading: false, error: error instanceof Error ? error.message : "道具加载失败" });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { ...state, reload };
};
