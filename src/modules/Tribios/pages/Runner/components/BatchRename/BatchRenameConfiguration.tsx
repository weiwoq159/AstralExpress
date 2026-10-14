import { useState } from "react";

import { FolderOpenOutlined } from "@ant-design/icons";
import { App, Button, Col, Flex, Input, InputNumber, Row, Tag, Typography } from "antd";

import { GlassPanel } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import { FieldLabel, runnerStyles, useChooseFolder } from "../../shared";
import { RENAME_MODE_LABELS, type BatchRenameConfig, type RenameMode } from "./types";

import styles from "./BatchRename.module.scss";

interface Props {
  manifest: Manifest;
  config: BatchRenameConfig;
  onChange: (patch: Partial<BatchRenameConfig>) => void;
}

const modes: RenameMode[] = ["prefix", "suffix", "replace", "sequence"];

export const BatchRenameConfiguration = ({ manifest, config, onChange }: Props) => {
  const { message } = App.useApp();
  const [selecting, setSelecting] = useState(false);

  const chooseFolder = async () => {
    if (!isTauri()) {
      message.info("请在桌面应用中选择文件夹，也可以直接输入路径");
      return;
    }
    setSelecting(true);
    try {
      const path = await open({
        directory: true,
        multiple: false,
        title: "选择处理文件夹",
        defaultPath: config.directory || undefined,
      });
      if (typeof path === "string") onChange({ directory: path });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "选择文件夹失败");
    } finally {
      setSelecting(false);
    }
  };

  return (
    <GlassPanel hoverable={false} className={runnerStyles.configuration}>
      <Flex align="flex-start" justify="space-between" gap={14} className={runnerStyles.panelHead}>
        <div>
          <div className={runnerStyles.sectionLabel}>01 / CONFIGURATION</div>
          <Typography.Title level={2}>任务配置</Typography.Title>
          <Typography.Paragraph>填写应用所需参数，生成本次重命名预览。</Typography.Paragraph>
        </div>
        <Tag color={manifest.status === "available" ? "success" : "warning"}>
          {manifest.status === "available" ? "应用可用" : "暂不可用"}
        </Tag>
      </Flex>

      <section className={runnerStyles.formSection} aria-labelledby="rename-directory-title">
        <Typography.Title level={3} id="rename-directory-title">
          <span className={runnerStyles.step}>01</span>选择处理位置
        </Typography.Title>
        <FieldLabel htmlFor="rename-directory" text="目标文件夹" required />
        <Flex gap={8} className={runnerStyles.pathRow}>
          <Input
            id="rename-directory"
            value={config.directory}
            onChange={(event) => onChange({ directory: event.target.value })}
            placeholder="输入需要处理的文件夹路径"
            aria-required="true"
          />
          <Button icon={<FolderOpenOutlined />} loading={selecting} onClick={chooseFolder}>
            选择文件夹
          </Button>
        </Flex>
        <Typography.Paragraph className={runnerStyles.fieldHint}>
          只处理此文件夹第一层的文件；子文件夹不会被纳入。
        </Typography.Paragraph>
        <Flex align="center" gap={10} className={runnerStyles.fileStrip}>
          <FolderOpenOutlined />
          <Typography.Text strong>待生成预览</Typography.Text>
          <Typography.Text>文件数量将在预览时读取</Typography.Text>
        </Flex>
      </section>

      <section className={runnerStyles.formSection} aria-labelledby="rename-rule-title">
        <Typography.Title level={3} id="rename-rule-title">
          <span className={runnerStyles.step}>02</span>设置命名规则
        </Typography.Title>
        <Row gutter={[8, 8]} role="group" aria-label="重命名方式">
          {modes.map((mode) => (
            <Col key={mode} xs={12} sm={6}>
              <Button
                block
                className={styles.ruleButton}
                aria-pressed={config.mode === mode}
                onClick={() => onChange({ mode })}
              >
                {RENAME_MODE_LABELS[mode]}
              </Button>
            </Col>
          ))}
        </Row>
        <Row gutter={[14, 14]} className={styles.ruleFields}>
          {(config.mode === "prefix" || config.mode === "sequence") && (
            <Col span={24}>
              <FieldLabel htmlFor="rename-prefix" text={config.mode === "sequence" ? "文件名前缀" : "前缀文字"} />
              <Input
                id="rename-prefix"
                value={config.prefix}
                onChange={(event) => onChange({ prefix: event.target.value })}
                placeholder="例如：秋日_"
              />
            </Col>
          )}
          {config.mode === "suffix" && (
            <Col span={24}>
              <FieldLabel htmlFor="rename-suffix" text="后缀文字" />
              <Input
                id="rename-suffix"
                value={config.suffix}
                onChange={(event) => onChange({ suffix: event.target.value })}
                placeholder="例如：_精选"
              />
            </Col>
          )}
          {config.mode === "replace" && (
            <>
              <Col xs={24} sm={12}>
                <FieldLabel htmlFor="rename-search" text="查找内容" />
                <Input
                  id="rename-search"
                  value={config.search}
                  onChange={(event) => onChange({ search: event.target.value })}
                />
              </Col>
              <Col xs={24} sm={12}>
                <FieldLabel htmlFor="rename-replace" text="替换为" />
                <Input
                  id="rename-replace"
                  value={config.replaceWith}
                  onChange={(event) => onChange({ replaceWith: event.target.value })}
                />
              </Col>
            </>
          )}
          {config.mode === "sequence" && (
            <>
              <Col xs={24} sm={12}>
                <FieldLabel htmlFor="rename-start" text="起始序号" />
                <InputNumber
                  id="rename-start"
                  min={0}
                  precision={0}
                  value={config.sequenceStart}
                  onChange={(value) => onChange({ sequenceStart: value ?? 1 })}
                />
              </Col>
              <Col xs={24} sm={12}>
                <FieldLabel htmlFor="rename-padding" text="序号位数" />
                <InputNumber
                  id="rename-padding"
                  min={1}
                  max={8}
                  precision={0}
                  value={config.sequencePadding}
                  onChange={(value) => onChange({ sequencePadding: value ?? 3 })}
                />
              </Col>
            </>
          )}
        </Row>
        <Typography.Paragraph className={runnerStyles.fieldHint}>
          保留原文件的扩展名；参数修改后，需要重新生成预览。
        </Typography.Paragraph>
      </section>
    </GlassPanel>
  );
};
