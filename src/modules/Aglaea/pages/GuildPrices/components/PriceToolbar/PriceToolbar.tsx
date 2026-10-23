import type { ReactNode } from "react";

import { Flex, Input, Select, Typography } from "antd";

import { GlassPanel } from "@/shared/components";

import type { SortOrder } from "../../domain/pricing";

const { Text } = Typography;

const ORDER_OPTIONS = [
  { value: "asc", label: "价格从低到高 ↑" },
  { value: "desc", label: "价格从高到低 ↓" },
];

export interface PriceToolbarProps {
  itemNames: readonly string[];
  /** 当前比较的道具名，空字符串表示不按道具比价。 */
  itemName: string;
  order: SortOrder;
  keyword: string;
  onItemChange: (itemName: string) => void;
  onOrderChange: (order: SortOrder) => void;
  onKeywordChange: (keyword: string) => void;
}

const Field = ({ label, grow, children }: { label: string; grow?: boolean; children: ReactNode }) => (
  <Flex vertical gap={6} flex={grow ? "2 1 230px" : "1 1 160px"}>
    <Text type="secondary" strong>
      {label}
    </Text>
    {children}
  </Flex>
);

export const PriceToolbar = ({
  itemNames,
  itemName,
  order,
  keyword,
  onItemChange,
  onOrderChange,
  onKeywordChange,
}: PriceToolbarProps) => (
  <GlassPanel hoverable={false} size="small">
    <Flex wrap align="end" gap={16}>
      <Field label="选择要比较的道具" grow>
        <Select
          showSearch={{ optionFilterProp: "label" }}
          value={itemName}
          onChange={onItemChange}
          options={[
            { value: "", label: "全部店铺（按编号）" },
            ...itemNames.map((name) => ({ value: name, label: name })),
          ]}
        />
      </Field>
      <Field label="排序方式">
        <Select value={order} onChange={onOrderChange} options={ORDER_OPTIONS} disabled={!itemName} />
      </Field>
      <Field label="筛选店铺名称 / 编号">
        <Input
          allowClear
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="例如：5 或 店铺 05"
        />
      </Field>
      <Text type="secondary">仅展示有售卖所选道具的店铺，按店内最低售价排序</Text>
    </Flex>
  </GlassPanel>
);
