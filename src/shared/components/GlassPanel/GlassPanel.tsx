import { Card } from "antd";
import type { CardProps } from "antd";

import styles from "./GlassPanel.module.scss";

export interface GlassPanelProps extends CardProps {
  /** 玻璃强度：clear 清透 / standard 标准 / frosted 柔雾 */
  glass?: "clear" | "standard" | "frosted";
}

export const GlassPanel = ({ glass = "standard", className, hoverable, ...rest }: GlassPanelProps) => {
  const classes = [styles.root, glass !== "standard" && styles[glass], hoverable === false && styles.static, className].filter(Boolean).join(" ");
  return <Card className={classes} hoverable={hoverable} {...rest} />;
};
