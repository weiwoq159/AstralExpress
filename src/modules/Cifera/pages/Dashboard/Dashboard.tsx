import { useTaskQueue } from "@/shared/hooks/useTaskQueue";
import { Hero, QuickAccessGrid, SectionHeader, TaskQueue } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Cifera } from "@cifera/module";
import { CiferaNavigation } from "@cifera/navigation";
import { useCrawlerStore } from "@cifera/stores/useCrawlerStore";
import { useCrawlerTaskStore } from "@cifera/stores/useCrawlerTaskStore";

export const Dashboard = () => {
  const manifests = useCrawlerStore((state) => state.items);
  const queue = useTaskQueue(useCrawlerTaskStore);



  const quickAccess = manifests.slice(0, 8);

  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Cifera.title}
        description={Cifera.description}
        tags={Cifera.tags}
        cover={Cifera.cover}
      />
      <SectionHeader sectionTitle="快捷入口" style={{ marginTop: 24 }} />
      <QuickAccessGrid manifests={quickAccess} />
      <SectionHeader
        sectionTitle="爬虫任务队列"
        viewAllPath={CiferaNavigation.tasks.path}
        style={{ marginBottom: 24, marginTop: 24 }}
      />
      <TaskQueue {...queue} tasks={queue.tasks.slice(0, 5)} manifests={manifests} pagination={false} />
    </div>
  );
};
