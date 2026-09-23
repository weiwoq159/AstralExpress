import { useMemo } from "react";
import { Link, useParams } from "react-router";

import { Col, Empty, Row } from "antd";

import { ManifestHeader, ManifestMethods, ManifestOverview } from "@/catalog/components";
import { SectionHeader } from "@/shared/components";
import styles from "@/shared/styles/Page.module.scss";
import { TaskQueue } from "@/tasks/components";
import { useTaskActions } from "@/tasks/hooks";

import { updateTaskStatus } from "../api";
import { ciferaNavigation } from "../navigation";
import { useTaskStore } from "../stores/useTaskStore";
import { useCrawlerStore } from "../stores/useCrawlerStore";

export const CrawlerDetail = () => {
  const { key } = useParams<{ key: string }>();

  const crawlers = useCrawlerStore((state) => state.items);
  const crawlersHasLoaded = useCrawlerStore((state) => state.hasLoaded);
  const tasks = useTaskStore((state) => state.items);
  const taskLoading = useTaskStore((state) => state.loading);
  const tasksLoaded = useTaskStore((state) => state.hasLoaded);
  const taskError = useTaskStore((state) => state.error);
  const loadTasks = useTaskStore((state) => state.load);
  const { onTaskAction, updatingTaskUids } = useTaskActions({ updateTaskStatus, onUpdated: loadTasks });

  const crawler = useMemo(() => crawlers.find((item) => item.key === key), [crawlers, key]);

  if (!crawler) {
    // 方案清单还没加载完之前不下"找不到"的结论，避免刷新页面时闪一下空态。
    if (!crawlersHasLoaded) return <div className={styles.page} />;

    return (
      <div className={styles.page}>
        <Empty style={{ marginTop: 80 }} description={`没有找到 key 为 "${key}" 的方案`}>
          <Link to={ciferaNavigation.library.path}>返回方案库</Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ManifestHeader
        icon={crawler.icon}
        name={crawler.name}
        description={crawler.description}
        status={crawler.status}
        backTo={ciferaNavigation.library.path}
        backLabel="返回方案库"
        runTo={`${ciferaNavigation.library.path}/${crawler.key}/run`}
      />

      <Row gutter={[24, 24]} align="stretch" style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <ManifestOverview category={crawler.category} entry={crawler.entry} tags={crawler.tags} />
        </Col>
        <Col xs={24} lg={12}>
          <ManifestMethods methods={crawler.methods} />
        </Col>
      </Row>

      <SectionHeader sectionTitle="相关任务" style={{ marginBottom: 24, marginTop: 24 }} />
      <TaskQueue
        tasks={tasks}
        manifests={crawlers}
        loading={taskLoading}
        hasLoaded={tasksLoaded}
        errorMessage={taskError}
        onRefresh={loadTasks}
        onTaskAction={onTaskAction}
        updatingTaskUids={updatingTaskUids}
        manifestKey={crawler.key}
      />
    </div>
  );
};
