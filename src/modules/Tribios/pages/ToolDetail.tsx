import { useMemo } from "react";
import { Link, useParams } from "react-router";

import { Col, Empty, Row } from "antd";

import { ManifestHeader, ManifestMethods, ManifestOverview } from "@/catalog/components";
import { SectionHeader } from "@/shared/components";
import styles from "@/shared/styles/Page.module.scss";
import { TaskQueue } from "@/tasks/components";
import { useTaskActions } from "@/tasks/hooks";

import { updateTaskStatus } from "../api";
import { toolsNavigation } from "../navigation";
import { useTaskStore } from "../stores/useTaskStore";
import { useToolStore } from "../stores/useToolStore";

export const ToolDetail = () => {
  const { key } = useParams<{ key: string }>();

  const tools = useToolStore((state) => state.items);
  const toolsHasLoaded = useToolStore((state) => state.hasLoaded);
  const tasks = useTaskStore((state) => state.items);
  const taskLoading = useTaskStore((state) => state.loading);
  const tasksLoaded = useTaskStore((state) => state.hasLoaded);
  const taskError = useTaskStore((state) => state.error);
  const loadTasks = useTaskStore((state) => state.load);
  const { onTaskAction, updatingTaskUids } = useTaskActions({ updateTaskStatus, onUpdated: loadTasks });

  const tool = useMemo(() => tools.find((item) => item.key === key), [tools, key]);

  if (!tool) {
    // 工具清单还没加载完之前不下"找不到"的结论，避免刷新页面时闪一下空态。
    if (!toolsHasLoaded) return <div className={styles.page} />;

    return (
      <div className={styles.page}>
        <Empty style={{ marginTop: 80 }} description={`没有找到 key 为 "${key}" 的应用`}>
          <Link to={toolsNavigation.library.path}>返回应用库</Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ManifestHeader
        icon={tool.icon}
        name={tool.name}
        description={tool.description}
        status={tool.status}
        backTo={toolsNavigation.library.path}
        runTo={`${toolsNavigation.library.path}/${tool.key}/run`}
      />

      <Row gutter={[24, 24]} align="stretch" style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <ManifestOverview category={tool.category} entry={tool.entry} tags={tool.tags} />
        </Col>
        <Col xs={24} lg={12}>
          <ManifestMethods methods={tool.methods} />
        </Col>
      </Row>

      <SectionHeader sectionTitle="相关任务" style={{ marginBottom: 24, marginTop: 24 }} />
      <TaskQueue
        tasks={tasks}
        manifests={tools}
        loading={taskLoading}
        hasLoaded={tasksLoaded}
        errorMessage={taskError}
        onRefresh={loadTasks}
        onTaskAction={onTaskAction}
        updatingTaskUids={updatingTaskUids}
        manifestKey={tool.key}
      />
    </div>
  );
};
