import { PluginLayout } from "@/shared/layout";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";
import { useToolStore } from "@tribios/stores/useToolStore";
import { useToolTaskStore } from "@tribios/stores/useToolTaskStore";

export const TribiosLayout = () => {
  const loadManifests = useToolStore((state) => state.fetchItems);
  const loadTasks = useToolTaskStore((state) => state.fetchItems);

  return (
    <PluginLayout
      module={Tribios}
      navigation={TribiosNavigation}
      loadManifests={loadManifests}
      loadTasks={loadTasks}
    />
  );
};
