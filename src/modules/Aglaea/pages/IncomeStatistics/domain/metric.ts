/** 当日收益总览中的一张指标卡。id 在列表内唯一，用作 React 列表的 key（key 是 React 保留属性，不能作为字段名）。 */
export interface RevenueMetric {
  id: "totalRevenue" | "cashRevenue" | "itemRevenue" | "rmbReference";
  title: string;
  value: number;
  /** 小数位数；金额统一保留两位。 */
  precision: number;
  /** 数值前缀，如人民币符号。 */
  prefix?: string;
  /** 数值单位，如“万两”。 */
  unit?: string;
  /** 卡片底部的说明文字。 */
  note: string;
  /** 说明文字旁的醒目标记，如“1 项待计价”。 */
  badge?: string;
  /** AppIcon 注册表里的图标名。 */
  icon: string;
  /** 主卡片使用高亮背景。 */
  primary?: boolean;
}
