import { useTaskQueue } from "@/shared/hooks/useTaskQueue";
import { Hero, TaskQueue } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { useToolStore } from "@tribios/stores/useToolStore";
import { useToolTaskStore } from "@tribios/stores/useToolTaskStore";
const featureTags = ["任务追踪", "进度监控", "执行历史"];

export const Tasks = () => {
  const queue = useTaskQueue(useToolTaskStore);


  const manifests = useToolStore((state) => state.items);
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="TASK QUEUE"
        title="任务队列"
        description="集中查看工具任务的执行状态与历史记录。"
        tags={featureTags}
      />
      <TaskQueue {...queue} manifests={manifests} styles={{ marginTop: 24 }} />
    </div>
  );
};
