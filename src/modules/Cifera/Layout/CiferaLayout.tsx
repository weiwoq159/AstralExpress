import { PluginLayout } from "@/shared/layout";

import { Cifera } from "@cifera/module";
import { CiferaNavigation } from "@cifera/navigation";
import { useCrawlerStore } from "@cifera/stores/useCrawlerStore";
import { useCrawlerTaskStore } from "@cifera/stores/useCrawlerTaskStore";

export const CiferaLayout = () => {
  const loadManifests = useCrawlerStore((state) => state.fetchItems);
  const loadTasks = useCrawlerTaskStore((state) => state.fetchItems);

  return (
    <PluginLayout module={Cifera} navigation={CiferaNavigation} loadManifests={loadManifests} loadTasks={loadTasks} />
  );
};
