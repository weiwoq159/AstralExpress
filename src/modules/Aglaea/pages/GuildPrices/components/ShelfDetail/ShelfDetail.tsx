import { Card, Col, Empty, Flex, Row, Tag, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import { SHELVES_PER_SHOP, formatPrice, toShelfSlots } from "../../domain/pricing";
import type { ShopWithShelves } from "../../domain/shop";

import styles from "./ShelfDetail.module.scss";

const { Text } = Typography;

export interface ShelfDetailProps {
  shop: ShopWithShelves | null;
  /** 当前比较的道具名，货架上的同名道具会高亮。 */
  itemName: string;
}

export const ShelfDetail = ({ shop, itemName }: ShelfDetailProps) => (
  <GlassPanel
    hoverable={false}
    title={
      <Flex vertical>
        <Text strong>{shop ? shop.name : "店铺货架明细"}</Text>
        <Text type="secondary" className={styles.subtitle}>
          {shop
            ? `店铺编号 #${shop.number} · 共 ${SHELVES_PER_SHOP} 个货架${itemName ? ` · 高亮为「${itemName}」` : ""}`
            : "选择左侧店铺查看"}
        </Text>
      </Flex>
    }
  >
    {shop ? (
      <Flex vertical gap={16}>
        <Row gutter={[12, 12]}>
          {toShelfSlots(shop).map((shelf, index) => {
            const hit = Boolean(itemName) && Boolean(shelf?.itemNames.includes(itemName));
            return (
              <Col key={index} xs={24} md={12}>
                <Card size="small" className={[styles.shelf, hit && styles.hit].filter(Boolean).join(" ")}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary" strong>
                      货架 {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text strong className={styles.price}>
                      {shelf ? formatPrice(shelf.price) : "—"}
                      <Text type="secondary" className={styles.unit}>
                        两
                      </Text>
                    </Text>
                  </Flex>
                  <Flex wrap gap={6} className={styles.items}>
                    {shelf ? (
                      shelf.itemNames.map((name) => (
                        <Tag key={name} color={name === itemName ? "processing" : undefined}>
                          {name}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">空货架</Text>
                    )}
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Text type="secondary" className={styles.subtitle}>
          同一货架上的 1～2 种道具共用一个价格；选择某种道具后按店内该道具的最低价排序。
          {shop.discountPercent > 0 && `本店优惠 ${shop.discountPercent}%，排行按折后价计算。`}
        </Text>
      </Flex>
    ) : (
      <Empty description="暂无店铺可展示" />
    )}
  </GlassPanel>
);
