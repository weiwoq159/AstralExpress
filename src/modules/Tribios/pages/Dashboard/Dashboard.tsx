import { Flex } from "antd";

import { Hero } from "@/shared/components";
import { QuickAccessGrid, SectionHeader } from "@/shared/components";
import { useManifests } from "@/shared/hooks/useManifest";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";

export const Dashboard = () => {
  const { QuickAccessManifests } = useManifests("tool", 8);

  return (
    <Flex vertical gap={18}>
      <Hero
        eyebrow="DASHBOARD"
        title={Tribios.title}
        description={Tribios.description}
        tags={Tribios.tags}
        cover={Tribios.cover}
      />
      <SectionHeader sectionTitle="快捷入口" viewAllPath={TribiosNavigation.library.path} style={{ marginTop: 12 }} />
      <QuickAccessGrid
        manifests={QuickAccessManifests}
        getItemPath={(manifest) => `${TribiosNavigation.library.path}/${encodeURIComponent(manifest.key)}`}
      />
    </Flex>
  );
};
