import { useState } from "react";

import { SafetyCertificateOutlined } from "@ant-design/icons";
import { App, Typography } from "antd";

import type { Manifest } from "@/shared/domain/manifest";

import { runnerStyles, useSubmitTask } from "../../shared";
import { Execution } from "../Execution/Execution";
import { ImageDedupConfiguration } from "./ImageDedupConfiguration";
import { ImageDedupQueue } from "./ImageDedupQueue";
import { ImageDedupResult } from "./ImageDedupResult";
import { DEDUP_MODE_LABELS, type ImageDedupConfig } from "./types";

import styles from "./ImageDedup.module.scss";

const initialConfig: ImageDedupConfig = {
  directory: "",
  recursive: true,
  mode: "exact",
  formats: ["JPG", "PNG", "WebP"],
};

export const ImageDedup = ({ manifest }: { manifest: Manifest }) => {
  const [config, setConfig] = useState<ImageDedupConfig>(initialConfig);
  const updateConfig = (patch: Partial<ImageDedupConfig>) => setConfig((current) => ({ ...current, ...patch }));
  const { message } = App.useApp();
  const { submit } = useSubmitTask(manifest);
  const canSubmit = config.directory.trim() !== "" && config.formats.length > 0;
  const scope = config.recursive ? "所选目录及子文件夹" : "仅所选目录";

  // 提交的表单即 config；真正的入队接口（submit_task）接入后在此调用，页面组件只负责触发。
  const handleSubmit = () => {
    if (!config.formats.length) {
      message.warning("请至少选择一种图片格式");
      return;
    }
    submit({
      title: "确认加入扫描队列",
      summary: [
        { label: "扫描目录", value: config.directory },
        { label: "扫描范围", value: scope },
        { label: "查找方式", value: DEDUP_MODE_LABELS[config.mode] },
        { label: "扫描格式", value: config.formats.join("、") },
      ],
      params: config,
    });
  };

  return (
    <>
      <div className={runnerStyles.workspace}>
        <ImageDedupConfiguration manifest={manifest} config={config} onChange={updateConfig} />
        <aside className={runnerStyles.side} aria-label="执行信息与入队">
          <Execution
            manifest={manifest}
            scope={scope}
            rows={[
              { label: "应用类型", value: "图片分析" },
              { label: "调度方式", value: manifest.isQueue ? "任务队列" : "即时运行", accent: true },
              { label: "扫描范围", value: config.directory.trim() ? scope : "等待选择文件夹" },
              { label: "查找方式", value: DEDUP_MODE_LABELS[config.mode] },
            ]}
            footer={
              <div className={styles.safety}>
                <SafetyCertificateOutlined />
                <div>
                  <Typography.Text strong>本次仅扫描</Typography.Text>
                  <Typography.Text>此任务只读取图片并生成重复分组，不会删除、移动或修改原图。</Typography.Text>
                </div>
              </div>
            }
          />
          <ImageDedupQueue canSubmit={canSubmit} onSubmit={handleSubmit} />
        </aside>
      </div>
      <ImageDedupResult />
    </>
  );
};
