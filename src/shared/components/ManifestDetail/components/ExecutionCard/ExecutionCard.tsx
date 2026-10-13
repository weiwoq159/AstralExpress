import { Row, Col, Typography } from "antd";

import { GlassPanel } from "@/shared/components";
import { type ManifestPresentation } from "@/shared/config/manifest";
import type { Manifest } from "@/shared/domain/manifest";

import { SectionIndex } from "../SectionIndex/SectionIndex";

import styles from "./ExecutionCard.module.scss";
const { Text } = Typography;
type ExecutionCardProps = { manifest: Manifest; status: ManifestPresentation };

export const ExecutionCard = ({ manifest, status }: ExecutionCardProps) => {
  const fields = [
    { label: "入口文件", value: manifest.entry || "未配置" },
    { label: "调度方式", value: manifest.isQueue ? "队列任务" : "即时运行" },
    { label: "可用状态", value: status.label },
  ];
  return (
    <GlassPanel className={styles.executionCard}>
      <SectionIndex index="03 / EXECUTION" title="执行信息" />
      <Text className={styles.routeMark}>{manifest.isQueue ? "QUEUE" : "DIRECT"}</Text>
      <Row>
        {fields.map(({ label, value }, index) => (
          <Col key={label} span={24} className={styles.sideField}>
            <Text className={styles.fieldLabel}>{label}</Text>
            <Text className={index === 0 ? styles.entryValue : styles.sideValue}>{value}</Text>
          </Col>
        ))}
      </Row>
    </GlassPanel>
  );
};
