import { Empty, Flex } from "antd";

import { Hero } from "@/shared/components";
import { QuickAccessGrid, SectionHeader, TaskCard } from "@/shared/components";
import { useManifestMap, useManifests } from "@/shared/hooks/useManifest";
import { useTasks } from "@/shared/hooks/useTasks";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";

const RECENT_TASK_LIMIT = 5;

export const Dashboard = () => {
  const { QuickAccessManifests } = useManifests("tool", 8);
  const { manifestMap } = useManifestMap("tool");
  const { tasks } = useTasks("tool");
  const recentTasks = tasks.slice(0, RECENT_TASK_LIMIT);

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
      <SectionHeader sectionTitle="最近任务" viewAllPath={TribiosNavigation.tasks.path} style={{ marginTop: 12 }} />
      {recentTasks.length ? (
        <Flex vertical gap={16}>
          {recentTasks.map((task) => (
            <TaskCard key={task.taskUid} task={task} manifest={manifestMap.get(task.manifestKey)} />
          ))}
        </Flex>
      ) : (
        <Empty description="还没有任务，去应用库运行一个队列应用吧" />
      )}
    </Flex>
  );
};
