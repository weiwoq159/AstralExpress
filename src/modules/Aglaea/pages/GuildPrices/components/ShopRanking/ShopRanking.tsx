import { Empty, Flex, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import { formatPrice, type RankedShop } from "../../domain/pricing";

import styles from "./ShopRanking.module.scss";

const { Text } = Typography;

export interface ShopRankingProps {
  ranked: readonly RankedShop[];
  itemName: string;
  activeShopId: number | null;
  onSelect: (shopId: number) => void;
}

export const ShopRanking = ({ ranked, itemName, activeShopId, onSelect }: ShopRankingProps) => (
  <GlassPanel
    hoverable={false}
    title={
      <Flex vertical>
        <Text strong>店铺报价排行</Text>
        <Text type="secondary" className={styles.subtitle}>
          {itemName ? `当前比较：${itemName}` : "全部店铺 · 按编号排列"}
        </Text>
      </Flex>
    }
    extra={<Text type="secondary">共 {ranked.length} 家</Text>}
  >
    {ranked.length === 0 ? (
      <Empty description="没有找到出售该道具的店铺，请切换道具或调整筛选" />
    ) : (
      <Flex vertical gap={4} className={styles.list}>
        {ranked.map(({ shop, price, shelfCount }, index) => {
          const active = shop.id === activeShopId;
          return (
            <button
              key={shop.id}
              type="button"
              aria-pressed={active}
              className={[styles.row, active && styles.active, index === 0 && styles.first].filter(Boolean).join(" ")}
              onClick={() => onSelect(shop.id)}
            >
              <Flex align="center" gap={10}>
                <Text className={styles.rank}>{String(index + 1).padStart(2, "0")}</Text>
                <Flex vertical flex="1 1 0" className={styles.name}>
                  <Text strong ellipsis>
                    {shop.name}
                  </Text>
                  <Text type="secondary" className={styles.sub}>
                    编号 #{shop.number} · {shelfCount} 个货架{itemName ? "在售" : "已录入"}
                    {shop.discountPercent > 0 && ` · 优惠 ${shop.discountPercent}%`}
                  </Text>
                </Flex>
                {price !== null ? (
                  <Text className={styles.price}>
                    {formatPrice(price)}
                    <Text type="secondary" className={styles.unit}>
                      两
                    </Text>
                  </Text>
                ) : (
                  <Text type="secondary" className={styles.sub}>
                    查看明细
                  </Text>
                )}
                <Text type="secondary" aria-hidden="true">
                  ›
                </Text>
              </Flex>
            </button>
          );
        })}
      </Flex>
    )}
  </GlassPanel>
);
