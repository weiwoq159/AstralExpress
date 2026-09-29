import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Manifest } from "@/shared/domain/manifest";

import { listTools } from "@tribios/api/library";

type ToolStore = {
  tools: Manifest[];
  loading: boolean;
  hasLoaded: boolean;
  fetchTools: () => Promise<Manifest[]>;
};

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => {
      let pendingRequest: Promise<Manifest[]> | undefined;

      return {
        tools: [],
        loading: false,
        hasLoaded: false,
        fetchTools: () => {
          // StrictMode 或多个组件同时加载时，共用正在进行的请求。
          if (pendingRequest) return pendingRequest;

          set({ loading: true });
          pendingRequest = listTools()
            .then((tools) => {
              set({ tools, hasLoaded: true });
              return tools;
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
      name: "astral-express:tribios:tools",
      // 刷新时先恢复当前窗口的列表，再由页面重新加载最新清单。
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ tools: state.tools }),
    },
  ),
);
