import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import { runnerStyles } from "../../shared";
import styles from "./BatchRename.module.scss";

const NUMBERS = ["待重命名", "保持不变", "需要处理"];

interface PreviewProps {
  canPreview: boolean;
  previewing?: boolean;
  onPreview: () => void;
  canSubmit: boolean;
  submitting?: boolean;
  onSubmit: () => void;
}

export const BatchRenamePreview = ({ canPreview, previewing, onPreview, canSubmit, submitting, onSubmit }: PreviewProps) => (
  <GlassPanel hoverable={false} className={runnerStyles.preview}>
    <div className={runnerStyles.sectionLabel}>03 / PREVIEW</div>
    <Typography.Title level={2}>操作预览</Typography.Title>
    <Flex align="flex-start" gap={11} className={styles.previewState}>
      <Flex align="center" justify="center" className={styles.previewIcon}>
        <EyeOutlined />
      </Flex>
      <div>
        <Typography.Title level={3}>等待生成预览</Typography.Title>
        <Typography.Paragraph>设置好文件夹和规则后，查看预期名称变化。</Typography.Paragraph>
      </div>
    </Flex>
    <Row gutter={8} className={styles.previewNumbers}>
      {NUMBERS.map((label) => (
        <Col key={label} span={8}>
          <div className={styles.previewNumber}>
            <Typography.Text strong className={styles.previewValue}>
              —
            </Typography.Text>
            <Typography.Text className={styles.previewLabel}>{label}</Typography.Text>
          </div>
        </Col>
      ))}
    </Row>
    <Flex vertical gap={9} className={styles.previewActions}>
      <Button icon={<EyeOutlined />} block disabled={!canPreview} loading={previewing} onClick={onPreview}>
        生成预览
      </Button>
      <Button
        type="primary"
        icon={<ArrowRightOutlined />}
        iconPlacement="end"
        block
        disabled={!canSubmit}
        loading={submitting}
        onClick={onSubmit}
      >
        确认并加入队列
      </Button>
      <Typography.Paragraph>Python 预览与任务入队接口尚未接入。</Typography.Paragraph>
    </Flex>
  </GlassPanel>
);
