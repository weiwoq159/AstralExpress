import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import { runnerStyles } from "../../shared";
import styles from "./ImageDedup.module.scss";

interface Props {
  canSubmit: boolean;
  submitting?: boolean;
  onSubmit: () => void;
}

export const ImageDedupQueue = ({ canSubmit, submitting, onSubmit }: Props) => (
  <GlassPanel hoverable={false} className={runnerStyles.preview}>
    <div className={runnerStyles.sectionLabel}>03 / QUEUE HANDOFF</div>
    <Typography.Title level={2}>交给队列扫描</Typography.Title>
    <div className={styles.queueVisual} aria-hidden="true">
      <Typography.Text className={styles.queueTitle}>IMAGE SCAN</Typography.Text>
      <Typography.Text className={styles.queueSub}>READY TO QUEUE</Typography.Text>
    </div>
    <Typography.Paragraph className={styles.queueNote}>
      图片较多时，扫描可能持续一段时间。入队后可离开当前页面；结果完成后在任务详情查看。
    </Typography.Paragraph>
    <Flex vertical gap={8} className={styles.queueAction}>
      <Button
        type="primary"
        icon={<ArrowRightOutlined />}
        iconPlacement="end"
        block
        disabled={!canSubmit}
        loading={submitting}
        onClick={onSubmit}
      >
        加入扫描队列
      </Button>
      <Typography.Paragraph className={styles.actionNote}>入队只开始分析，后续处理由你在结果页决定。</Typography.Paragraph>
    </Flex>
  </GlassPanel>
);
