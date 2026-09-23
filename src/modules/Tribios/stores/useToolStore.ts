import type { Manifest } from "@/shared/domain/manifest";
import { createAsyncListStore } from "@/shared/hooks/createAsyncListStore";

import { listTools } from "../api";

export const useToolStore = createAsyncListStore<Manifest>({
  fetchItems: listTools,
  fallbackErrorMessage: "工具清单读取失败",
});
