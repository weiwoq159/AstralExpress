import { useNavigate } from "react-router";

import { Row, Col, Card, Typography } from "antd";

import { AppIcon } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

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
        return (
          <Col key={manifest.key} xs={12} sm={12} md={8} lg={6}>
            <Card
              hoverable={manifest.link !== undefined}
              onClick={() => navigate(manifest.link)}
              className={styles.card}
              classNames={{ body: styles.cardBody }}
            >
              <Text className={styles.icon} aria-hidden="true">
                <AppIcon icon={manifest.icon} />
              </Text>
              <Text className={styles.title}>{manifest.name}</Text>
              <Text className={styles.description}>{manifest.description}</Text>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};
