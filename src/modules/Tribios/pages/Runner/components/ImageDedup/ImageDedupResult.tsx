import { CheckOutlined } from "@ant-design/icons";
import { Col, Flex, Row, Tag, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import { runnerStyles } from "../../shared";
import styles from "./ImageDedup.module.scss";

const BULLETS = ["内容相同的图片归入同一组", "展示每张图片所在位置与文件信息", "原始图片保持不变，处理操作需再次确认"];

export const ImageDedupResult = () => (
  <GlassPanel hoverable={false} className={styles.result}>
    <Flex align="center" justify="space-between" gap={16} className={styles.resultHead}>
      <div>
        <div className={runnerStyles.sectionLabel}>04 / AFTER SCAN</div>
        <Typography.Title level={2}>扫描完成后</Typography.Title>
      </div>
      <Typography.Text>结果展示位置 · 任务详情页</Typography.Text>
    </Flex>
    <Row gutter={[22, 22]} className={styles.resultBody}>
      <Col xs={24} lg={13}>
        <Typography.Title level={3}>按重复图片分组查看</Typography.Title>
        <Typography.Paragraph className={styles.resultCopy}>
          扫描完成后，任务详情会展示重复分组、文件路径与体积。你可以先核对每一组，再决定如何处理。此处不展示尚未扫描出的结果。
        </Typography.Paragraph>
        <Flex vertical gap={9} className={styles.bullets}>
          {BULLETS.map((text) => (
            <Flex key={text} align="center" gap={9}>
              <CheckOutlined />
              <Typography.Text>{text}</Typography.Text>
            </Flex>
          ))}
        </Flex>
      </Col>
      <Col xs={24} lg={11}>
        <Flex align="center" gap={14} className={styles.sample}>
          <div className={styles.sampleArt} aria-hidden="true">
            <span />
            <span />
          </div>
          <div>
            <Typography.Text strong className={styles.sampleTitle}>重复分组示意</Typography.Text>
            <Typography.Paragraph>这里只展示结果页的呈现方式，不代表当前目录已完成扫描。</Typography.Paragraph>
            <Tag color="blue" variant="filled">结果将在任务详情生成</Tag>
          </div>
        </Flex>
      </Col>
    </Row>
    <Typography.Text className={styles.resultFoot}>分组插画仅为示意，不读取真实图片。</Typography.Text>
  </GlassPanel>
);
