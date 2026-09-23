import { useNavigate } from "react-router";

import { Card, Col, Empty, Flex, Row, Typography } from "antd";

import { AppIcon } from "@/shared/components";
import type { ManifestStatus } from "@/shared/domain/manifest";

import { manifestStatusLabel, manifestStatusTone } from "../../config/manifestStatus";

import styles from "./CatalogGrid.module.scss";

const { Text } = Typography;

export type CatalogGridItem = {
  key: string;
  name: string;
  description: string;
  icon: string;
  status: ManifestStatus;
  tags: readonly string[];
  /** 详情页路由。未提供时卡片照常展示，但不可点击也不可聚焦。 */
  link?: string;
};

type CatalogGridProps = {
  items: readonly CatalogGridItem[];
  emptyText?: string;
};

export const CatalogGrid = ({ items, emptyText = "暂无匹配项" }: CatalogGridProps) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return <Empty className={styles.empty} image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => {
        const link = item.link;
        return (
          <Col key={item.key} xs={24} sm={12} lg={8} xxl={6}>
            <Card
              hoverable={link !== undefined}
              className={styles.card}
              classNames={{ body: styles.cardBody }}
              {...(link === undefined
                ? {}
                : {
                    onClick: () => navigate(link),
                    "aria-label": `查看${item.name}详情`,
                    role: "button",
                    tabIndex: 0,
                  })}
            >
              <Flex justify="space-between" align="start">
                <Text className={styles.icon} aria-hidden="true">
                  <AppIcon icon={item.icon} />
                </Text>
                <span className={styles.status} data-tone={manifestStatusTone[item.status]}>
                  {manifestStatusLabel[item.status]}
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
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};
