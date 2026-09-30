import { createListStore } from "@/shared/stores/createListStore";

import { listTools } from "@tribios/api/library";

export const useToolStore = createListStore({
  storageKey: "astral-express:tools:manifests",
  load: listTools,
});
