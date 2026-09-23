import type { ReactNode } from "react";

import { Card, Flex, Pagination, Typography } from "antd";

import styles from "./CatalogPanel.module.scss";

const { Text } = Typography;

type CatalogPanelProps = {
  title: string;
  description?: string;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  children: ReactNode;
};

export const CatalogPanel = ({ title, description, total, page, pageSize, onPageChange, children }: CatalogPanelProps) => (
  <Card className={styles.card} classNames={{ body: styles.cardBody }}>
    <Flex justify="space-between" align="center" wrap gap={12}>
      <div>
        <div className={styles.title}>{title}</div>
        {description && <Text className={styles.description}>{description}</Text>}
      </div>
      <span className={styles.total}>共 {total} 项</span>
    </Flex>

    <div className={styles.body}>{children}</div>

    {total > pageSize && (
      <Flex justify="end" className={styles.pagination}>
        <Pagination current={page} pageSize={pageSize} total={total} onChange={onPageChange} simple />
      </Flex>
    )}
  </Card>
);
