import type { Manifest } from "@/shared/domain/manifest";
import { createAsyncListStore } from "@/shared/hooks/createAsyncListStore";

import { listCrawlers } from "../api";

export const useCrawlerStore = createAsyncListStore<Manifest>({
  fetchItems: listCrawlers,
  fallbackErrorMessage: "采集方案清单读取失败",
});
