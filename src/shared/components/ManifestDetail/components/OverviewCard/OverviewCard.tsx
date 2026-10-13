import { Flex, Row, Col, Typography, Tag } from "antd";

import { GlassPanel, AppIcon } from "@/shared/components";
import { type ManifestPresentation, getManifestCategoryLabel } from "@/shared/config/manifest";
import type { Manifest } from "@/shared/domain/manifest";

import { SectionIndex } from "../SectionIndex/SectionIndex";

import styles from "./OverviewCard.module.scss";
const { Text, Title, Paragraph } = Typography;

type OverviewCardProps = {
  manifest: Manifest;
  status: ManifestPresentation;
};
export const OverviewCard = ({ manifest, status }: OverviewCardProps) => {
  return (
    <GlassPanel glass="frosted" hoverable={false}>
      <SectionIndex index="01 / OVERVIEW" title="应用概览" />
      <Row gutter={[16, 12]} align="middle">
        <Col flex="none">
          <Text className={styles.icon} aria-hidden="true">
            <AppIcon icon={manifest.icon} />
          </Text>
        </Col>
        <Col flex="auto">
          <Title level={4} className={styles.name}>
            {manifest.name}
          </Title>
          <Text className={styles.category}>{getManifestCategoryLabel(manifest.category)}</Text>
        </Col>
        <Col flex="none">
          <Text className={styles.status} data-tone={status.tone}>
            {status.label}
          </Text>
        </Col>
      </Row>
      <Paragraph className={styles.description}>{manifest.description || "暂无应用说明。"}</Paragraph>
      <Flex className={styles.tagArea} vertical>
        <Text className={styles.fieldLabel}>相关标签</Text>
        <Flex gap={6} className={styles.tags} vertical>
          {manifest.tags.length ? (
            <Flex gap={6}>
              {manifest.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Flex>
          ) : (
            <Col>
              <Text type="secondary">暂无标签</Text>
            </Col>
          )}
        </Flex>
      </Flex>
    </GlassPanel>
  );
};
