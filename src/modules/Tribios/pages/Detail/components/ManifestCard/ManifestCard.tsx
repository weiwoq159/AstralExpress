import { Row, Col, Typography } from "antd";

import { GlassPanel } from "@/shared/components";
import { type ManifestPresentation } from "@/shared/config/manifest";
import type { Manifest } from "@/shared/domain/manifest";

import { SectionIndex } from "../SectionIndex/SectionIndex";

import styles from "./ManifestCard.module.scss";

const { Text } = Typography;

type ManifestCardProps = {
  manifest: Manifest;
  status: ManifestPresentation;
};
export const ManifestCard = ({ manifest, status }: ManifestCardProps) => {
  const fields = [
    { label: "应用 Key", value: manifest.key },
    { label: "原始分类", value: manifest.category },
    { label: "清单排序", value: String(manifest.order) },
    { label: "图标标识", value: manifest.icon || "—" },
    { label: "当前状态", value: status.label },
    { label: "执行方式", value: manifest.isQueue ? "加入任务队列" : "直接执行" },
  ];
  return (
    <GlassPanel glass="frosted" hoverable={false}>
      <SectionIndex index="02 / MANIFEST" title="应用清单" />
      <Row className={styles.details}>
        {fields.map(({ label, value }) => (
          <Col key={label} xs={24} sm={12} className={styles.detailField}>
            <Text className={styles.detailLabel}>{label}</Text>
            <Text className={styles.detailValue}>{value}</Text>
          </Col>
        ))}
      </Row>
    </GlassPanel>
  );
};
