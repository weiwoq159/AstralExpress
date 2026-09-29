import { Hero, SectionHeader, QuickAccessGrid } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Cifera } from "@cifera/module";
import { useCrawlerStore } from "@cifera/stores/useCrawlerStore";

export const Dashboard = () => {
  const crawlers = useCrawlerStore((state) => state.crawlers);
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Cifera.title}
        description={Cifera.description}
        tags={Cifera.tags}
        cover={Cifera.cover}
      />
      <SectionHeader sectionTitle="快捷入口" viewAllPath="library" style={{ marginTop: 24 }} />
      <QuickAccessGrid manifests={crawlers.slice(0, 8)} />
      <SectionHeader sectionTitle="任务队列" viewAllPath="tasks" style={{ marginBottom: 24, marginTop: 24 }} />
    </div>
  );
};
