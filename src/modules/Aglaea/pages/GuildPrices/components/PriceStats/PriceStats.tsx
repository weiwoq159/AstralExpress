import { Col, Row } from "antd";

import { MetricCard } from "../../../../shared/components";
import { SHELVES_PER_SHOP, type PriceSummary } from "../../domain/pricing";

export interface PriceStatsProps {
  summary: PriceSummary;
  /** 当前比较的道具名，空字符串表示未选。 */
  itemName: string;
}

export const PriceStats = ({ summary, itemName }: PriceStatsProps) => {
  const { shopCount, sellingCount, lowest, highest } = summary;
  const hasPrice = lowest !== null && highest !== null;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} xl={6}>
        <MetricCard
          title="已记录店铺"
          value={shopCount}
          unit="家"
          note={`每店固定 ${SHELVES_PER_SHOP} 个货架`}
          icon="AppstoreOutlined"
        />
      </Col>
      <Col xs={12} xl={6}>
        <MetricCard
          title="在售店铺"
          value={sellingCount ?? 0}
          unit="家"
          note={itemName ? `正在比较：${itemName}` : "选择道具后统计"}
          icon="ShoppingOutlined"
        />
      </Col>
      <Col xs={12} xl={6}>
        <MetricCard
          title="最低售价"
          value={lowest?.price ?? 0}
          unit="两"
          note={hasPrice ? lowest.shopName : "暂无报价"}
          icon="DollarOutlined"
        />
      </Col>
      <Col xs={12} xl={6}>
        <MetricCard
          title="最高售价"
          value={highest?.price ?? 0}
          unit="两"
          note={hasPrice ? highest.shopName : "暂无报价"}
          icon="LineChartOutlined"
        />
      </Col>
    </Row>
  );
};
