import { useNavigate } from "react-router";

import { Row, Col, Typography, Flex } from "antd";

import { AppIcon, GlassCard } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import { manifestStatusConfig } from "../../config/manifestStatus";

import styles from "./CatalogGrid.module.scss";

const { Text } = Typography;

interface CatalogGridProps {
  items: Manifest[];
}
export const CatalogGrid = ({ items }: CatalogGridProps) => {
  const navigate = useNavigate();
  return (
    <Row gutter={[24, 24]}>
      {items.map((item) => (
        <Col key={item.key} span={6}>
          <GlassCard
            hoverable
            onClick={() => navigate(`/library/${item.key}`)}
            aria-label={`查看${item.name}详情`}
            role="button"
            tabIndex={0}
            className={styles.card}
          >
            <Flex justify="space-between" align="start">
              <Text className={styles.icon} aria-hidden="true">
                <AppIcon icon={item.icon} />
              </Text>
              <span className={styles.status} data-tone={manifestStatusConfig[item.status].tone}>
                {manifestStatusConfig[item.status].label}
              </span>
            </Flex>
            <Text className={styles.title}>{item.name}</Text>
            <Text className={styles.description}>{item.description}</Text>
            {item.tags.length > 0 && (
              <Flex gap={6} wrap className={styles.tags}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </Flex>
            )}
          </GlassCard>
        </Col>
      ))}
    </Row>
  );
};
