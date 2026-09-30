import { useState, type CSSProperties } from "react";

import { Alert, Button, Empty, Flex, Progress, Table, type TableProps } from "antd";

import { formatTaskTime, taskStatusPresentation, type TaskAction } from "@/shared/config/task";
import type { Manifest } from "@/shared/domain/manifest";
import type { Task, TaskActionKind } from "@/shared/domain/task";
import { useManifestNameMap } from "@/shared/hooks/useManifestNameMap";

import { GlassCard } from "../GlassCard/GlassCard";
import { TaskDetailModal } from "../TaskDetailModal/TaskDetailModal";

import css from "./TaskQueue.module.scss";

interface TaskQueueProps {
  tasks: readonly Task[];
  manifests: readonly Pick<Manifest, "key" | "name">[];
  styles?: CSSProperties;
  loading?: boolean;
  error?: string | null;
  actionError?: string | null;
  pagination?: TableProps<Task>["pagination"];
  onTaskAction?: (task: Task, action: TaskActionKind) => void;
  updatingTaskUids?: ReadonlySet<string>;
}
const { Column } = Table;

const statusFilters = Object.entries(taskStatusPresentation).map(([value, { label }]) => ({ text: label, value }));
const progressStroke = { "0%": "#1f6fff", "100%": "#44c2ff" };
const failedProgressStroke = { "0%": "#e35d5d", "100%": "#ff8f8f" };
const defaultPagination: TableProps<Task>["pagination"] = {
  defaultPageSize: 10,
  showSizeChanger: false,
  hideOnSinglePage: true,
  showTotal: (total) => `共 ${total} 项`,
};
const tableLocale = {
  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />,
  filterConfirm: "确定",
  filterReset: "重置",
};

export const TaskQueue = ({
  tasks,
  manifests,
  styles,
  loading = false,
  error,
  actionError,
  pagination = defaultPagination,
  onTaskAction,
  updatingTaskUids,
}: TaskQueueProps) => {
  const manifestNameMap = useManifestNameMap(manifests);
  const [detailTaskUid, setDetailTaskUid] = useState<string | null>(null);
  const detailTask = tasks.find((task) => task.taskUid === detailTaskUid) ?? null;

  const handleTaskAction = (task: Task, action: TaskAction) => {
    if (action === "view") {
      setDetailTaskUid(task.taskUid);
      return;
    }
    if (!updatingTaskUids?.has(task.taskUid)) {
      onTaskAction?.(task, action);
    }
  };

  return (
    <GlassCard classNames={{ body: css.cardBody }} style={styles}>
      {error && <Alert className={css.alert} type="error" title="读取任务失败" description={error} showIcon />}
      {actionError && (
        <Alert className={css.alert} type="error" title="任务操作失败" description={actionError} showIcon />
      )}
      <Table<Task>
        className={css.table}
        dataSource={tasks}
        rowKey="taskUid"
        loading={loading}
        pagination={pagination}
        tableLayout="fixed"
        scroll={{ x: 1040 }}
        locale={tableLocale}
      >
        <Column<Task>
          title="任务"
          dataIndex="taskUid"
          key="taskUid"
          width={300}
          render={(_, task) => {
            const name = manifestNameMap.get(task.manifestKey) ?? task.manifestKey;
            const detail = task.errorMessage || task.title;

            return (
              <Flex vertical gap={4} className={css.taskContent}>
                <Button
                  type="link"
                  className={css.taskName}
                  title={name}
                  onClick={() => setDetailTaskUid(task.taskUid)}
                >
                  {name}
                </Button>
                <span className={css.taskDetail} title={detail}>
                  {detail}
                </span>
                <span className={css.uid} title={task.taskUid}>
                  {task.taskUid}
                </span>
              </Flex>
            );
          }}
        />
        <Column<Task>
          title="状态"
          dataIndex="status"
          key="status"
          width={110}
          align="center"
          filters={statusFilters}
          onFilter={(value, task) => task.status === value}
          render={(_, task) => {
            const { label, tone } = taskStatusPresentation[task.status];

            return (
              <span className={css.status} data-tone={tone}>
                {label}
              </span>
            );
          }}
        />
        <Column<Task>
          title="进度"
          dataIndex="progress"
          key="progress"
          width={280}
          render={(_, task) => {
            const { stage } = taskStatusPresentation[task.status];
            const failed = task.status === "failed";

            return (
              <Flex vertical gap={4} className={css.progress}>
                <Flex align="center" justify="space-between" className={css.progressMeta}>
                  <span>{stage}</span>
                  <span>{task.total > 0 ? `${task.done}/${task.total}` : `${task.progress}%`}</span>
                </Flex>
                <Progress
                  percent={task.progress}
                  showInfo={false}
                  size="small"
                  status={failed ? "exception" : undefined}
                  strokeColor={failed ? failedProgressStroke : progressStroke}
                  railColor="rgba(165, 191, 221, 0.28)"
                  aria-label={`${task.title}进度`}
                />
              </Flex>
            );
          }}
        />
        <Column<Task>
          title="创建时间"
          dataIndex="createdAt"
          key="createdAt"
          width={190}
          align="center"
          render={(createdAt: Task["createdAt"]) => (
            <time className={css.createdAt} dateTime={createdAt}>
              {formatTaskTime(createdAt)}
            </time>
          )}
        />
        <Column<Task>
          title="操作"
          key="action"
          width={160}
          align="center"
          render={(_, task) => {
            const { actions } = taskStatusPresentation[task.status];
            const updating = updatingTaskUids?.has(task.taskUid) ?? false;

            return (
              <Flex justify="center" wrap gap={4}>
                {actions.map(({ action, label }) => (
                  <Button
                    key={action}
                    type="link"
                    size="small"
                    className={css.action}
                    loading={action !== "view" && updating}
                    disabled={action !== "view" && (!onTaskAction || updating)}
                    title={action !== "view" && !onTaskAction ? "当前操作暂不可用" : undefined}
                    onClick={() => handleTaskAction(task, action)}
                  >
                    {label}
                  </Button>
                ))}
              </Flex>
            );
          }}
        />
      </Table>
      <TaskDetailModal
        task={detailTask}
        manifestName={detailTask ? manifestNameMap.get(detailTask.manifestKey) : undefined}
        open={detailTask !== null}
        onClose={() => setDetailTaskUid(null)}
      />
    </GlassCard>
  );
};
