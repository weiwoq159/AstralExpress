import type { ReactNode } from "react";

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  PauseCircleOutlined,
  WarningOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Flex, Progress, Tag, Typography } from "antd";
import dayjs from "dayjs";

import type { Manifest } from "@/shared/domain/manifest";
import type { Task, TaskStatus } from "@/shared/domain/task";

import { AppIcon } from "../AppIcon/AppIcon";
import { GlassPanel } from "../GlassPanel/GlassPanel";

import styles from "./TaskCard.module.scss";

const { Text, Title } = Typography;

const formatTime = (iso: string) => dayjs(iso).format("MM-DD HH:mm");

const STATUS_META = {
  running: { label: "运行中", icon: <SyncOutlined spin /> },
  pending: { label: "等待中", icon: <ClockCircleOutlined /> },
  paused: { label: "已暂停", icon: <PauseCircleOutlined /> },
  success: { label: "已完成", icon: <CheckCircleOutlined /> },
  failed: { label: "已失败", icon: <CloseCircleOutlined /> },
  canceled: { label: "已取消", icon: <MinusCircleOutlined /> },
  interrupted: { label: "已中断", icon: <WarningOutlined /> },
} satisfies Record<TaskStatus, { label: string; icon: ReactNode }>;

type TaskCardProps = {
  task: Task;
  /** 任务所属应用的清单，用于展示应用图标；清单已被移除时回退为兜底图标。 */
  manifest?: Manifest;
};

export const TaskCard = ({ task, manifest }: TaskCardProps) => {
  const status = STATUS_META[task.status];

  return (
    <GlassPanel className={`${styles.card} ${styles[task.status]}`} styles={{ body: { padding: 0 } }}>
      <Flex align="flex-start" gap={16} className={styles.body}>
        <Text className={styles.icon} aria-hidden="true">
          <AppIcon icon={manifest?.icon} />
        </Text>
        <Flex vertical gap={8} flex={1} className={styles.main}>
          <Flex align="flex-start" justify="space-between" gap={16}>
            <Flex align="baseline" gap={8} className={styles.identity}>
              <Title level={3} ellipsis className={styles.title}>
                {task.title}
              </Title>
              <Text type="secondary" ellipsis className={styles.manifest}>
                {task.manifestKey}
              </Text>
            </Flex>
            <Tag bordered={false} icon={status.icon} className={`${styles.status} ${styles[`status-${task.status}`]}`}>
              {status.label}
            </Tag>
          </Flex>
          <Flex align="center" wrap gap={8} className={styles.meta}>
            <Text type="secondary">创建于 {formatTime(task.createdAt)}</Text>
            <span className={styles.divider} aria-hidden="true" />
            <Text type="secondary">
              已处理 {task.done} / {task.total}
            </Text>
          </Flex>
          <Progress
            percent={task.progress}
            size="small"
            aria-label={`${task.title}进度`}
            className={styles.progress}
          />
        </Flex>
        <Text className={styles.arrow} aria-hidden="true">
          <ArrowRightOutlined />
        </Text>
      </Flex>
    </GlassPanel>
  );
};
