import { createListStore } from "@/shared/stores/createListStore";

import { listCrawlers } from "@cifera/api/library";

export const useCrawlerStore = createListStore({
  storageKey: "astral-express:crawler:manifests",
  load: listCrawlers,
});
