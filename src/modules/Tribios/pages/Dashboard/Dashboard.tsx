import { useTaskQueue } from "@/shared/hooks/useTaskQueue";
import { Hero, QuickAccessGrid, SectionHeader, TaskQueue } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";
import { useToolStore } from "@tribios/stores/useToolStore";
import { useToolTaskStore } from "@tribios/stores/useToolTaskStore";

export const Dashboard = () => {
  const manifests = useToolStore((state) => state.items);
  const queue = useTaskQueue(useToolTaskStore);



  const quickAccess = manifests.slice(0, 8).map((manifest) => ({
    ...manifest,
    link: `${TribiosNavigation.library.path}/${manifest.key}`,
  }));

  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Tribios.title}
        description={Tribios.description}
        tags={Tribios.tags}
        cover={Tribios.cover}
      />
      <SectionHeader sectionTitle="快捷入口" viewAllPath={TribiosNavigation.library.path} style={{ marginTop: 24 }} />
      <QuickAccessGrid manifests={quickAccess} />
      <SectionHeader
        sectionTitle="任务队列"
        viewAllPath={TribiosNavigation.tasks.path}
        style={{ marginBottom: 24, marginTop: 24 }}
      />
      <TaskQueue {...queue} tasks={queue.tasks.slice(0, 5)} manifests={manifests} pagination={false} />
    </div>
  );
};
