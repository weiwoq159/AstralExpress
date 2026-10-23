import { useMemo, useState } from "react";

import { Alert, Avatar, Button, Card, Empty, Flex, Input, Tag, Typography } from "antd";

import { AppIcon } from "@/shared/components";
import type { Item } from "@/modules/Aglaea/domain/items/Item";

import { ITEM_CATEGORY_GROUPS } from "../../../../constants/itemCategoryLabels";
import { ITEM_ICONS } from "../../../../constants/itemIcons";

import styles from "./QuickAdd.module.scss";

const { Text } = Typography;

const ALL = "all";

export interface QuickAddProps {
  items: readonly Item[];
  loading?: boolean;
  error?: string | null;
  onAdd: (item: Item) => void;
  onCreateCustom: () => void;
}

export const QuickAdd = ({ items, loading, error, onAdd, onCreateCustom }: QuickAddProps) => {
  const [category, setCategory] = useState<string>(ALL);
  const [keyword, setKeyword] = useState("");

  // 标签取自 ITEM_CATEGORY_GROUPS（兽决、内丹已合并），不按库里有没有道具过滤。
  const categoryOptions = [
    { value: ALL, label: "全部" },
    ...ITEM_CATEGORY_GROUPS.map(({ key, label }) => ({ value: key, label })),
  ];

  const visibleItems = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    const group = ITEM_CATEGORY_GROUPS.find(({ key }) => key === category);
    return items.filter(
      (item) =>
        (!group || group.categories.includes(item.category)) && item.name.toLowerCase().includes(text),
    );
  }, [items, category, keyword]);

  const handleCategoryChange = (value: unknown) => {
    // 再次点击已选项时 antd 会返回 null，按“全部”处理。
    setCategory(typeof value === "string" ? value : ALL);
    setKeyword("");
  };

  return (
    <Card
      variant="borderless"
      className={styles.panel}
      loading={loading}
      title={
        <Flex align="baseline" gap={8}>
          <span className={styles.title}>快速记入</span>
          <Text type="secondary" className={styles.subtitle}>
            点一下，多一份收获
          </Text>
        </Flex>
      }
      extra={
        <Button type="link" size="small" icon={<AppIcon icon="PlusOutlined" />} onClick={onCreateCustom}>
          自定义物品
        </Button>
      }
    >
      {error ? (
        <Alert type="error" showIcon title="道具加载失败" description={error} />
      ) : (
        <>
          <Flex align="flex-start" gap={12} className={styles.tools}>
            {/* 标签多时在自己这一块里换行，搜索框始终固定在同一行右侧。 */}
            <div className={styles.tabs}>
              <Tag.CheckableTagGroup
                aria-label="物品分类"
                options={categoryOptions}
                value={category}
                onChange={handleCategoryChange}
              />
            </div>
            <Input
              allowClear
              className={styles.search}
              placeholder="搜索物品…"
              aria-label="搜索物品"
              prefix={<AppIcon icon="SearchOutlined" />}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </Flex>

          {visibleItems.length > 0 ? (
            <div className={styles.grid}>
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.item}
                  aria-label={`记入${item.name}`}
                  onClick={() => onAdd(item)}
                >
                  <Avatar shape="square" size={29} src={item.icon ? ITEM_ICONS[item.icon] : undefined}>
                    {item.name.slice(0, 1)}
                  </Avatar>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>
                      {item.referencePrice === null ? "暂未计价" : `${item.referencePrice.toFixed(2)} 万两`}
                    </span>
                  </span>
                  <AppIcon icon="PlusOutlined" className={styles.plus} />
                </button>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={items.length === 0 ? "还没有物品，先添加一个自定义物品" : "没有找到这个物品，试试其他名称"}
            />
          )}

          <Flex justify="space-between" align="center" className={styles.hint}>
            <Text type="secondary">点击物品，数量 +1</Text>
            <Text type="secondary">参考物价 · 非实时报价</Text>
          </Flex>
        </>
      )}
    </Card>
  );
};
