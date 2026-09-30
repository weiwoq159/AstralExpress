import { Card, type CardProps } from "antd";

import styles from "./GlassCard.module.scss";

export interface GlassCardProps extends CardProps {
  /** 是否启用悬浮抬升效果，用于可点击进入的卡片。 */
  hoverable?: boolean;
}

/**
 * 应用内玻璃卡片的唯一出口——封装 mixins.glass-card，避免各处重复
 * `@use mixins as m; .card { @include m.glass-card; }` 的样板代码。
 * 内容区留白、图标、文案等仍由调用方通过 classNames/styles 自行控制。
 */
export const GlassCard = ({ className, hoverable, ...rest }: GlassCardProps) => (
  <Card className={[styles.card, hoverable && styles.hoverable, className].filter(Boolean).join(" ")} {...rest} />
);
