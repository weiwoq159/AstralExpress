import { useState } from "react";

import { App, Flex, Row, Col } from "antd";

import { Hero } from "@/shared/components";

import AglaeaCover from "@/assets/images/cover/Aglaea.webp";

import { insertItem } from "../../api/items";
import { useItems } from "../../hooks/useItems";
import { AglaeaNavigation } from "../../navigation";
import { MetricCard } from "../../shared/components";
import { CustomItemModal, QuickAdd } from "./components";
import type { CustomItemFormValues } from "./components/CustomItemModal/CustomItemModal";
import type { RevenueMetric } from "./domain/metric";
// 暂用原型里的演示数据，接入记账数据后改为由 hook 提供。
const metrics: RevenueMetric[] = [
  {
    id: "totalRevenue",
    title: "今日合计收益",
    value: 1686,
    precision: 2,
    unit: "万两",
    note: "已结算游戏币 + 物品参考估值",
    icon: "DollarOutlined",
    primary: true,
  },
  {
    id: "cashRevenue",
    title: "游戏币实收",
    value: 1080,
    precision: 2,
    unit: "万两",
    note: "已完成 3 段结算",
    icon: "WalletOutlined",
  },
  {
    id: "itemRevenue",
    title: "物品参考估值",
    value: 606,
    precision: 2,
    unit: "万两",
    note: "6 种物品",
    badge: "1 项待计价",
    icon: "ShoppingOutlined",
  },
  {
    id: "rmbReference",
    title: "人民币参考值",
    value: 112.4,
    precision: 2,
    prefix: "¥",
    note: "每小时约 ¥31.22 · 非实际收入",
    icon: "LineChartOutlined",
  },
];

export const IncomeStatistics = () => {
  const { message } = App.useApp();
  const { items, loading, error, reload } = useItems();
  const [customOpen, setCustomOpen] = useState(false);

  // 成功才关闭弹窗并刷新列表；失败时保留弹窗和已填内容，方便改名后重试。
  const handleCreateItem = async ({ name, icon, category, referencePrice }: CustomItemFormValues) => {
    try {
      await insertItem({ name, icon, category, referencePrice });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "新增物品失败");
      return;
    }
    message.success(`${name.trim()} 已新增`);
    setCustomOpen(false);
    reload();
  };

  return (
    <Flex vertical gap={22}>
      <Hero
        title={AglaeaNavigation.incomeStatistics.title}
        eyebrow="Aglaea"
        description="梦幻西游记账本：登录、下线时记下各账号的金币，自动算出每次的收支。"
        tags={["记账本", "多账号", "金币"]}
        cover={AglaeaCover}
      />
      <Row gutter={[24, 24]}>
        {metrics.map(({ id, ...metric }) => (
          <Col key={id} xs={24} md={12} xl={6}>
            <MetricCard {...metric} />
          </Col>
        ))}
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={18}>
          {/* 今日收获表还没做，记入先留空。 */}
          <QuickAdd items={items} loading={loading} error={error} onAdd={() => {}} onCreateCustom={() => setCustomOpen(true)} />
        </Col>
      </Row>
      <CustomItemModal open={customOpen} onCancel={() => setCustomOpen(false)} onSubmit={handleCreateItem} />
    </Flex>
  );
};
