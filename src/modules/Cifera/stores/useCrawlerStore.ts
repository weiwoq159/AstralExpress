import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Manifest } from "@/shared/domain/manifest";

import { listCrawlers } from "@cifera/api/library";

type CrawlerStore = {
  crawlers: Manifest[];
  loading: boolean;
  hasLoaded: boolean;
  fetchCrawlers: () => Promise<Manifest[]>;
};

export const useCrawlerStore = create<CrawlerStore>()(
  persist(
    (set) => {
      let pendingRequest: Promise<Manifest[]> | undefined;

      return {
        crawlers: [],
        loading: false,
        hasLoaded: false,
        fetchCrawlers: () => {
          // StrictMode 或多个组件同时加载时，共用正在进行的请求。
          if (pendingRequest) return pendingRequest;

          set({ loading: true });
          pendingRequest = listCrawlers()
            .then((crawlers) => {
              set({ crawlers, hasLoaded: true });
              return crawlers;
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
      name: "astral-express:tribios:crawlers",
      // 刷新时先恢复当前窗口的列表，再由页面重新加载最新清单。
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ crawlers: state.crawlers }),
    },
  ),
);
