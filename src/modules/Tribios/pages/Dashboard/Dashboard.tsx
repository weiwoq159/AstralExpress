import { useMemo } from "react";

import { Hero, SectionHeader, QuickAccessGrid, TaskQueue } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";

import { useToolStore } from "../../stores/useToolStore";

export const Dashboard = () => {
  const tools = useToolStore((state) => state.tools);
  const quickAccessTools = useMemo(() => {
    return tools.slice(0, 8).map((tool) => ({
      ...tool,
      link: `${TribiosNavigation.library.path}/${tool.key}`,
    }));
  }, [tools]);
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Tribios.title}
        description={Tribios.description}
        tags={Tribios.tags}
        cover={Tribios.cover}
      />
      <SectionHeader sectionTitle="快捷入口" viewAllPath="library" style={{ marginTop: 24 }} />
      <QuickAccessGrid manifests={quickAccessTools} />
      <SectionHeader sectionTitle="任务队列" viewAllPath="tasks" style={{ marginBottom: 24, marginTop: 24 }} />
      <TaskQueue />
    </div>
  );
};
