import { useMemo } from "react";

import { Button, Flex, Progress, type TableColumnsType } from "antd";

import { formatTaskTime, taskStatusPresentation, type TaskAction } from "@/shared/config/task";
import type { Manifest } from "@/shared/domain/manifest";
import type { Task } from "@/shared/domain/task";

import styles from "./TaskQueue.module.scss";

type UseTaskQueueColumnsOptions = {
  manifests: readonly Pick<Manifest, "key" | "name">[];
  onTaskAction: (task: Task, action: TaskAction) => void;
  onTaskSelect: (taskUid: string) => void;
  updatingTaskUids: ReadonlySet<string>;
};

const STATUS_FILTERS = Object.entries(taskStatusPresentation).map(([value, presentation]) => ({
  text: presentation.label,
  value,
}));

const PROGRESS_STROKE = { "0%": "#1f6fff", "100%": "#44c2ff" };
const PROGRESS_STROKE_FAILED = { "0%": "#e35d5d", "100%": "#ff8f8f" };
const PROGRESS_RAIL = "rgba(165, 191, 221, 0.28)";

export const useTaskQueueColumns = ({
  manifests,
  onTaskAction,
  onTaskSelect,
  updatingTaskUids,
}: UseTaskQueueColumnsOptions): TableColumnsType<Task> => {
  const manifestNameMap = useMemo(
    () => new Map(manifests.map((manifest) => [manifest.key, manifest.name])),
    [manifests],
  );

  return useMemo<TableColumnsType<Task>>(
    () => [
      {
        title: "任务",
        dataIndex: "title",
        key: "title",
        width: 240,
        render: (_, task) => {
          const name = manifestNameMap.get(task.manifestKey) ?? task.manifestKey;
          const detail = task.errorMessage ?? task.title;

          return (
            <Flex vertical gap={4} className={styles.taskContent}>
              <Button type="link" className={styles.taskName} title={name} onClick={() => onTaskSelect(task.taskUid)}>
                {name}
              </Button>
              <span className={styles.taskDetail} title={detail}>
                {detail}
              </span>
            </Flex>
          );
        },
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 110,
        filters: STATUS_FILTERS,
        onFilter: (value, task) => task.status === value,
        render: (_, task) => {
          const { tone, label } = taskStatusPresentation[task.status];

          return (
            <span className={styles.status} data-tone={tone}>
              {label}
            </span>
          );
        },
      },
      {
        title: "进度",
        dataIndex: "progress",
        key: "progress",
        width: 300,
        render: (_, task) => {
          const { stage } = taskStatusPresentation[task.status];
          const failed = task.status === "failed";

          return (
            <Flex vertical gap={4} className={styles.progress}>
              <Flex align="center" justify="space-between" className={styles.progressMeta}>
                <span>{stage}</span>
                <span>{task.total > 0 ? `${task.done}/${task.total}` : `${task.progress}%`}</span>
              </Flex>
              <Progress
                percent={task.progress}
                showInfo={false}
                size="small"
                status={failed ? "exception" : undefined}
                strokeColor={failed ? PROGRESS_STROKE_FAILED : PROGRESS_STROKE}
                railColor={PROGRESS_RAIL}
                aria-label={`${task.title}进度`}
              />
            </Flex>
          );
        },
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: 120,
        render: (createdAt: string) => (
          <time className={styles.createdAt} dateTime={createdAt}>
            {formatTaskTime(createdAt)}
          </time>
        ),
      },
      {
        title: "操作",
        key: "action",
        align: "center",
        width: 140,
        render: (_, task) => {
          const { actions } = taskStatusPresentation[task.status];
          const updating = updatingTaskUids.has(task.taskUid);

          return (
            <Flex justify="center" wrap="wrap" gap={4}>
              {actions.map((item) => (
                <Button
                  key={item.action}
                  type="link"
                  size="small"
                  loading={updating}
                  className={styles.action}
                  onClick={() => onTaskAction(task, item.action)}
                >
                  {item.actionLabel}
                </Button>
              ))}
            </Flex>
          );
        },
      },
    ],
    [manifestNameMap, onTaskAction, onTaskSelect, updatingTaskUids],
  );
};
