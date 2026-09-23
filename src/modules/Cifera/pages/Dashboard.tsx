import { Hero, QuickAccessGrid, SectionHeader } from "@/shared/components";
import { TaskQueue } from "@/tasks/components";
import { useTaskActions } from "@/tasks/hooks";

import { updateTaskStatus } from "../api";
import { Cifera } from "../module";
import { ciferaNavigation } from "../navigation";
import { useTaskStore } from "../stores/useTaskStore";
import { useCrawlerStore } from "../stores/useCrawlerStore";
import styles from "@/shared/styles/Page.module.scss";

export const Dashboard = () => {
  const crawlers = useCrawlerStore((state) => state.items);
  const tasks = useTaskStore((state) => state.items);
  const taskLoading = useTaskStore((state) => state.loading);
  const tasksLoaded = useTaskStore((state) => state.hasLoaded);
  const taskError = useTaskStore((state) => state.error);
  const loadTasks = useTaskStore((state) => state.load);
  const { onTaskAction, updatingTaskUids } = useTaskActions({ updateTaskStatus, onUpdated: loadTasks });

  return (
    <div className={styles.page}>
      <Hero eyebrow="DASHBOARD" title="欢迎回来。" description={Cifera.description} tags={Cifera.tags} />
      <SectionHeader sectionTitle="快捷入口" viewAllPath="library" style={{ marginTop: 24 }} />
      <QuickAccessGrid
        items={crawlers.map((item) => ({
          key: item.key,
          name: item.name,
          description: item.description,
          icon: item.icon,
          targetWebsite: typeof item.metadata.targetWebsite === "string" ? item.metadata.targetWebsite : undefined,
          link: `${ciferaNavigation.library.path}/${item.key}`,
        }))}
      />
      <SectionHeader sectionTitle="任务队列" viewAllPath="tasks" style={{ marginBottom: 24, marginTop: 24 }} />
      <TaskQueue
        tasks={tasks}
        manifests={crawlers}
        loading={taskLoading}
        hasLoaded={tasksLoaded}
        errorMessage={taskError}
        onRefresh={loadTasks}
        onTaskAction={onTaskAction}
        updatingTaskUids={updatingTaskUids}
      />
    </div>
  );
};
