import { FolderOpenOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Flex, Input, Row, Switch, Tag, Typography } from "antd";

import { GlassPanel } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import { FieldLabel, runnerStyles, useChooseFolder } from "../../shared";
import { DEDUP_FORMATS, DEDUP_MODES, type ImageDedupConfig } from "./types";

import styles from "./ImageDedup.module.scss";

interface Props {
  manifest: Manifest;
  config: ImageDedupConfig;
  onChange: (patch: Partial<ImageDedupConfig>) => void;
}

export const ImageDedupConfiguration = ({ manifest, config, onChange }: Props) => {
  const { selecting, choose } = useChooseFolder(config.directory, (directory) => onChange({ directory }));

  return (
    <GlassPanel hoverable={false} className={runnerStyles.configuration}>
      <Flex align="flex-start" justify="space-between" gap={14} className={runnerStyles.panelHead}>
        <div>
          <div className={runnerStyles.sectionLabel}>01 / CONFIGURATION</div>
          <Typography.Title level={2}>任务配置</Typography.Title>
          <Typography.Paragraph>指定扫描范围和判断方式，任务将在后台完成比对。</Typography.Paragraph>
        </div>
        <Tag color={manifest.status === "available" ? "success" : "warning"}>
          {manifest.status === "available" ? "应用可用" : "暂不可用"}
        </Tag>
      </Flex>

      <section className={runnerStyles.formSection} aria-labelledby="dedup-directory-title">
        <Typography.Title level={3} id="dedup-directory-title">
          <span className={runnerStyles.step}>01</span>选择扫描位置
        </Typography.Title>
        <FieldLabel htmlFor="dedup-directory" text="图片文件夹" required />
        <Flex gap={8} className={runnerStyles.pathRow}>
          <Input
            id="dedup-directory"
            value={config.directory}
            onChange={(event) => onChange({ directory: event.target.value })}
            placeholder="输入要扫描的文件夹路径"
            aria-required="true"
          />
          <Button icon={<FolderOpenOutlined />} loading={selecting} onClick={choose}>
            选择文件夹
          </Button>
        </Flex>
        <Typography.Paragraph className={runnerStyles.fieldHint}>
          目录越大，扫描时间越长。入队后可在任务队列查看进度。
        </Typography.Paragraph>
        <Flex align="center" gap={10} className={runnerStyles.fileStrip}>
          <FolderOpenOutlined />
          <Typography.Text strong>待队列扫描</Typography.Text>
          <Typography.Text>图片数量与占用空间将在任务执行时统计</Typography.Text>
        </Flex>
        <Flex align="center" justify="space-between" gap={12} className={styles.switchRow}>
          <div>
            <Typography.Text strong className={styles.switchTitle}>包含子文件夹</Typography.Text>
            <Typography.Text className={styles.switchDesc}>一起扫描目录内的多层图片</Typography.Text>
          </div>
          <Switch
            checked={config.recursive}
            onChange={(recursive) => onChange({ recursive })}
            aria-label="包含子文件夹"
          />
        </Flex>
      </section>

      <section className={runnerStyles.formSection} aria-labelledby="dedup-mode-title">
        <Typography.Title level={3} id="dedup-mode-title">
          <span className={runnerStyles.step}>02</span>选择查找方式
        </Typography.Title>
        <Row gutter={[9, 9]} role="group" aria-label="重复图片判断方式">
          {DEDUP_MODES.map((mode) => (
            <Col key={mode.value} xs={24} sm={12}>
              <Button
                block
                disabled={mode.disabled}
                className={styles.modeButton}
                aria-pressed={config.mode === mode.value}
                onClick={() => onChange({ mode: mode.value })}
              >
                <Flex vertical align="flex-start" gap={5}>
                  <Typography.Text strong>{mode.label}</Typography.Text>
                  <Typography.Text>{mode.description}</Typography.Text>
                </Flex>
              </Button>
            </Col>
          ))}
        </Row>
        <Typography.Paragraph className={runnerStyles.fieldHint}>
          适合整理多次复制、改名后仍内容相同的图片。
        </Typography.Paragraph>
        <Flex align="center" wrap gap={7} className={styles.formats}>
          <Typography.Text strong className={styles.formatsLabel}>扫描格式</Typography.Text>
          <Checkbox.Group value={config.formats} onChange={(formats) => onChange({ formats: formats as string[] })}>
            <Flex wrap gap={7}>
              {DEDUP_FORMATS.map((format) => (
                <Checkbox key={format.value} value={format.value} className={styles.format}>
                  {format.label}
                </Checkbox>
              ))}
            </Flex>
          </Checkbox.Group>
        </Flex>
      </section>
    </GlassPanel>
  );
};
