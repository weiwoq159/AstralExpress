import type { ReactNode } from "react";

import { InfoCircleOutlined } from "@ant-design/icons";

import { GlassPanel } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import styles from "./Execution.module.scss";

export interface ExecutionRow {
  label: string;
  value: string;
  accent?: boolean;
}

interface Props {
  manifest: Manifest;
  scope: string;
  /** 自定义信息行；缺省时显示应用 Key、调度方式、入口文件与处理范围。 */
  rows?: ExecutionRow[];
  /** 自定义底部提示；缺省时显示「预览只展示名称变化」的说明。 */
  footer?: ReactNode;
}

export const Execution = ({ manifest, scope, rows, footer }: Props) => {
  const items: ExecutionRow[] = rows ?? [
    { label: "应用 Key", value: manifest.key },
    { label: "调度方式", value: manifest.isQueue ? "任务队列" : "即时运行", accent: true },
    { label: "入口文件", value: manifest.entry },
    { label: "处理范围", value: scope },
  ];

  return (
    <GlassPanel hoverable={false} className={styles.execution}>
      <div className={styles.sectionLabel}>02 / EXECUTION</div>
      <h2>本次执行</h2>
      <dl className={styles.overview}>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd className={item.accent ? styles.accent : undefined}>{item.value}</dd>
          </div>
        ))}
      </dl>
      {footer ?? (
        <div className={styles.note}>
          <InfoCircleOutlined />
          <span>预览只展示名称变化。确认入队后，队列才会运行该应用的执行方法。</span>
        </div>
      )}
    </GlassPanel>
  );
};
