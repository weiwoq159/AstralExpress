import { Card, Flex, Statistic, Tag, Typography } from "antd";

import { AppIcon } from "@/shared/components";

import styles from "./MetricCard.module.scss";

const { Text } = Typography;

export interface MetricCardProps {
  title: string;
  value: number;
  /** 小数位数；不传时按数值原样显示。 */
  precision?: number;
  /** 数值前缀，如人民币符号。 */
  prefix?: string;
  /** 数值单位，如“万两”。 */
  unit?: string;
  /** 卡片底部的说明文字。 */
  note?: string;
  /** 说明文字旁的醒目标记，如“1 项待计价”。 */
  badge?: string;
  /** AppIcon 注册表里的图标名。 */
  icon?: string;
  /** 主卡片使用高亮背景。 */
  primary?: boolean;
}

/** 概览指标卡：标题、数值、说明三段式，Aglaea 各页面的数据概览共用。 */
export const MetricCard = ({ title, value, precision, prefix, unit, note, badge, icon, primary }: MetricCardProps) => (
  <Card
    variant="borderless"
    className={[styles.card, primary && styles.primary].filter(Boolean).join(" ")}
    classNames={{ body: styles.body }}
  >
    <Flex justify="space-between" align="center">
      <Text className={styles.label}>{title}</Text>
      {icon && <AppIcon icon={icon} className={styles.icon} />}
    </Flex>
    <Statistic
      value={value}
      precision={precision}
      prefix={prefix}
      suffix={unit}
      classNames={{ content: styles.value, suffix: styles.unit }}
    />
    {(note || badge) && (
      <Flex align="center" gap={6} className={styles.note}>
        {note && <Text className={styles.noteText}>{note}</Text>}
        {badge && <Tag className={styles.badge}>{badge}</Tag>}
      </Flex>
    )}
  </Card>
);
