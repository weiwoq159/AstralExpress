import { useState } from "react";

import { App } from "antd";

import type { Manifest } from "@/shared/domain/manifest";

import { runnerStyles, useSubmitTask } from "../../shared";
import { Execution } from "../Execution/Execution";
import { BatchRenameChanges } from "./BatchRenameChanges";
import { BatchRenameConfiguration } from "./BatchRenameConfiguration";
import { BatchRenamePreview } from "./BatchRenamePreview";
import { RENAME_MODE_LABELS, type BatchRenameConfig } from "./types";

import styles from "./BatchRename.module.scss";

const initialConfig: BatchRenameConfig = {
  directory: "",
  mode: "prefix",
  prefix: "",
  suffix: "",
  search: "",
  replaceWith: "",
  sequenceStart: 1,
  sequencePadding: 3,
};

export const BatchRename = ({ manifest }: { manifest: Manifest }) => {
  const [config, setConfig] = useState<BatchRenameConfig>(initialConfig);
  const updateConfig = (patch: Partial<BatchRenameConfig>) => setConfig((current) => ({ ...current, ...patch }));
  const { message } = App.useApp();
  const { submit } = useSubmitTask(manifest);
  const canPreview = config.directory.trim() !== "";
  const canSubmit = canPreview;

  // 预览同样基于 config；预览接口接入后在此调用。
  const handlePreview = () => {
    // TODO: const result = await previewRename(config);
    message.info("预览接口尚未接入");
  };
  // 提交的表单即 config；真正的入队接口（submit_task）接入后在此调用，页面组件只负责触发。
  const handleSubmit = () =>
    submit({
      title: "确认加入队列？",
      summary: [
        { label: "目标文件夹", value: config.directory },
        { label: "命名方式", value: RENAME_MODE_LABELS[config.mode] },
      ],
      params: config,
    });

  return (
    <>
      <div className={runnerStyles.workspace}>
        <BatchRenameConfiguration manifest={manifest} config={config} onChange={updateConfig} />
        <aside className={runnerStyles.side} aria-label="运行信息与操作">
          <Execution
            manifest={manifest}
            scope={config.directory.trim() ? "当前文件夹第一层 · 待预览" : "等待选择文件夹"}
          />
          <BatchRenamePreview canPreview={canPreview} onPreview={handlePreview} canSubmit={canSubmit} onSubmit={handleSubmit} />
        </aside>
      </div>
      <BatchRenameChanges />
    </>
  );
};
