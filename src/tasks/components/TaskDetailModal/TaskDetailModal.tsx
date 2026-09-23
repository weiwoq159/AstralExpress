import { Alert, Descriptions, Flex, Modal, Progress, Typography } from "antd";

import { formatTaskTime, taskStatusPresentation } from "@/shared/config/task";
import type { Task } from "@/shared/domain/task";

import styles from "./TaskDetailModal.module.scss";

const { Text } = Typography;

type TaskDetailModalProps = {
  task: Task | null;
  manifestName?: string;
  open: boolean;
  onClose: () => void;
};

/** 尝试把存进 DB 的 JSON 字符串格式化一下；解析不了就原样展示，不抛错。 */
const formatJson = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

export const TaskDetailModal = ({ task, manifestName, open, onClose }: TaskDetailModalProps) => {
  if (!task) return null;

  const { label, tone } = taskStatusPresentation[task.status];
  const params = formatJson(task.paramsJson);
  const result = formatJson(task.resultJson);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={manifestName ?? task.manifestKey} width={560}>
      <Flex align="center" gap={10} className={styles.headerRow}>
        <span className={styles.status} data-tone={tone}>
          {label}
        </span>
        <Text className={styles.title}>{task.title}</Text>
      </Flex>

      <Progress
        percent={task.progress}
        status={task.status === "failed" ? "exception" : undefined}
        className={styles.progress}
      />

      <Descriptions
        className={styles.descriptions}
        column={2}
        size="small"
        items={[
          { key: "created", label: "创建时间", children: formatTaskTime(task.createdAt) },
          { key: "started", label: "开始时间", children: formatTaskTime(task.startedAt) },
          { key: "finished", label: "结束时间", children: formatTaskTime(task.finishedAt) },
          {
            key: "progress",
            label: "进度",
            children: task.total > 0 ? `${task.done}/${task.total}` : `${task.progress}%`,
          },
        ]}
      />

      {task.errorMessage && (
        <Alert className={styles.alert} type="error" showIcon message="错误信息" description={task.errorMessage} />
      )}

      {params && (
        <div className={styles.section}>
          <Text strong className={styles.sectionTitle}>
            参数
          </Text>
          <pre className={styles.code}>{params}</pre>
        </div>
      )}

      {result && (
        <div className={styles.section}>
          <Text strong className={styles.sectionTitle}>
            结果
          </Text>
          <pre className={styles.code}>{result}</pre>
        </div>
      )}
    </Modal>
  );
};
