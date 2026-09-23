import { useCallback, useMemo, useState } from "react";

import { Alert, Button, Card, Empty, Flex, Table } from "antd";

import type { TaskAction } from "@/shared/config/task";
import type { Manifest } from "@/shared/domain/manifest";
import type { Task } from "@/shared/domain/task";

import { TaskDetailModal } from "../TaskDetailModal/TaskDetailModal";
import { useTaskQueueColumns } from "./useTaskQueueColumns";

import styles from "./TaskQueue.module.scss";

const DEFAULT_LIMIT = 5;
const NOOP_TASK_ACTION = () => undefined;
const NOOP_TASK_SELECT = () => undefined;
const EMPTY_UPDATING_TASK_UIDS: ReadonlySet<string> = new Set();
const TABLE_LOCALE = {
  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />,
};
const TABLE_SCROLL = { x: 910 };

type TaskQueueProps = {
  tasks: readonly Task[];
  manifests: readonly Pick<Manifest, "key" | "name">[];
  loading: boolean;
  hasLoaded: boolean;
  errorMessage?: string;
  onRefresh: () => void | Promise<void>;
  manifestKey?: string;
  limit?: number;
  onTaskAction?: (task: Task, action: TaskAction) => void;
  onTaskSelect?: (taskUid: string) => void;
  updatingTaskUids?: ReadonlySet<string>;
};

export const TaskQueue = ({
  tasks,
  manifests,
  loading,
  hasLoaded,
  errorMessage,
  onRefresh,
  manifestKey,
  limit = DEFAULT_LIMIT,
  onTaskAction = NOOP_TASK_ACTION,
  onTaskSelect = NOOP_TASK_SELECT,
  updatingTaskUids = EMPTY_UPDATING_TASK_UIDS,
}: TaskQueueProps) => {
  const [detailTaskUid, setDetailTaskUid] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    const list = manifestKey ? tasks.filter((task) => task.manifestKey === manifestKey) : tasks;
    return list.slice(0, limit);
  }, [limit, manifestKey, tasks]);

  // 点任务名或者"查看/查看结果"操作都打开详情弹窗——语义上是一回事，不需要区分两个入口。
  const handleTaskSelect = useCallback(
    (taskUid: string) => {
      setDetailTaskUid(taskUid);
      onTaskSelect(taskUid);
    },
    [onTaskSelect],
  );

  const handleTaskAction = useCallback(
    (task: Task, action: TaskAction) => {
      if (action === "view") {
        setDetailTaskUid(task.taskUid);
        return;
      }
      onTaskAction(task, action);
    },
    [onTaskAction],
  );

  const columns = useTaskQueueColumns({
    manifests,
    onTaskAction: handleTaskAction,
    onTaskSelect: handleTaskSelect,
    updatingTaskUids,
  });

  const handleRefresh = useCallback(() => {
    void onRefresh();
  }, [onRefresh]);

  const showFullError = Boolean(errorMessage) && visibleTasks.length === 0;

  const detailTask = useMemo(
    () => tasks.find((task) => task.taskUid === detailTaskUid) ?? null,
    [tasks, detailTaskUid],
  );
  const detailManifestName = useMemo(
    () => manifests.find((manifest) => manifest.key === detailTask?.manifestKey)?.name,
    [manifests, detailTask],
  );

  return (
    <Card
      className={styles.card}
      classNames={{ body: styles.cardBody }}
      loading={loading && !hasLoaded}
      extra={
        <Button loading={loading} onClick={handleRefresh}>
          刷新
        </Button>
      }
    >
      {showFullError ? (
        <Flex vertical align="center" gap={14} className={styles.emptyState}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={errorMessage} />
          <Button onClick={handleRefresh}>重新加载</Button>
        </Flex>
      ) : (
        <>
          {errorMessage ? <Alert className={styles.alert} type="error" title={errorMessage} showIcon /> : null}
          <Table<Task>
            className={styles.table}
            columns={columns}
            dataSource={[...visibleTasks]}
            rowKey="taskUid"
            pagination={false}
            loading={loading && hasLoaded}
            tableLayout="fixed"
            scroll={TABLE_SCROLL}
            locale={TABLE_LOCALE}
          />
        </>
      )}

      <TaskDetailModal
        task={detailTask}
        manifestName={detailManifestName}
        open={detailTask !== null}
        onClose={() => setDetailTaskUid(null)}
      />
    </Card>
  );
};
