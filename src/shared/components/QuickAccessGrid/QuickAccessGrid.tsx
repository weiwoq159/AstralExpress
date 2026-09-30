import { useNavigate } from "react-router";

import { Row, Col, Typography } from "antd";

import { AppIcon } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import { GlassCard } from "../GlassCard/GlassCard";

import styles from "./QuickAccessGrid.module.scss";

const { Text } = Typography;
type QuickAccessManifest = Manifest & {
  link?: string;
};
interface QuickAccessGridProps {
  manifests: QuickAccessManifest[];
}

export const QuickAccessGrid = ({ manifests }: QuickAccessGridProps) => {
  const navigate = useNavigate();
  return (
    <Row gutter={[24, 24]}>
      {manifests.map((manifest) => {
        const { link } = manifest;
        return (
          <Col key={manifest.key} xs={12} sm={12} md={8} lg={6}>
            <GlassCard
              hoverable
              onClick={link ? () => navigate(link) : undefined}
              className={styles.card}
              classNames={{ body: styles.cardBody }}
            >
              <Text className={styles.icon} aria-hidden="true">
                <AppIcon icon={manifest.icon} />
              </Text>
              <Text className={styles.title}>{manifest.name}</Text>
              <Text className={styles.description}>{manifest.description}</Text>
            </GlassCard>
          </Col>
        );
      })}
    </Row>
  );
};
