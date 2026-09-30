import { Library as SharedLibrary, useLibrary } from "@/shared/features/Library";

import { useCrawlerStore } from "@cifera/stores/useCrawlerStore";

export const Library = () => {
  const library = useLibrary(useCrawlerStore);

  return <SharedLibrary library={library} itemLabel="采集器" />;
};
