import { Card, Col, Row, Statistic, type ColProps } from "antd";

import styles from "./OverviewCards.module.scss";

export type OverviewCardItem = {
  key: string;
  label: string;
  value: number | string;
  description?: string;
};

type OverviewCardsProps = {
  items: readonly OverviewCardItem[];
  columnProps?: ColProps;
};

const DEFAULT_COLUMN_PROPS: ColProps = { xs: 24, sm: 12, md: 8 };

export const OverviewCards = ({ items, columnProps = DEFAULT_COLUMN_PROPS }: OverviewCardsProps) => (
  <Row gutter={[16, 16]}>
    {items.map((item) => (
      <Col key={item.key} {...columnProps}>
        <Card className={styles.card}>
          <Statistic className={styles.statistic} title={item.label} value={item.value} formatter={(value) => value} />
          {item.description && <div className={styles.description}>{item.description}</div>}
        </Card>
      </Col>
    ))}
  </Row>
);
