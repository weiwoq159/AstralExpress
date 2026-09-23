import { Hero } from "@/shared/components";
import { TaskQueue } from "@/tasks/components";
import { useTaskActions } from "@/tasks/hooks";

import { updateTaskStatus } from "../api";
import { useTaskStore } from "../stores/useTaskStore";
import { useToolStore } from "../stores/useToolStore";
import styles from "@/shared/styles/Page.module.scss";

const featureTags = ["任务追踪", "进度监控", "执行历史"];

export const Tasks = () => {
  const tools = useToolStore((state) => state.items);
  const tasks = useTaskStore((state) => state.items);
  const loading = useTaskStore((state) => state.loading);
  const hasLoaded = useTaskStore((state) => state.hasLoaded);
  const errorMessage = useTaskStore((state) => state.error);
  const loadTasks = useTaskStore((state) => state.load);
  const { onTaskAction, updatingTaskUids } = useTaskActions({ updateTaskStatus, onUpdated: loadTasks });

  return (
    <div className={styles.page}>
      <Hero eyebrow="TASK QUEUE" title="任务队列" description="集中查看工具任务的执行状态与历史记录。" tags={featureTags} />
      <section aria-label="任务队列" style={{ marginTop: 24 }}>
        <TaskQueue
          tasks={tasks}
          manifests={tools}
          loading={loading}
          hasLoaded={hasLoaded}
          errorMessage={errorMessage}
          onRefresh={loadTasks}
          onTaskAction={onTaskAction}
          updatingTaskUids={updatingTaskUids}
          limit={tasks.length}
        />
      </section>
    </div>
  );
};
