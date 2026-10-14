import { Layout, Typography } from "antd";

import styles from "./HubFooter.module.scss";

const { Footer } = Layout;
const { Text } = Typography;

interface HubFooterProps {
  openedCount?: number;
  plannedCount?: number;
}

const StarIcon = () => (
  <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />
  </svg>
);

export const HubFooter = ({ openedCount = 1, plannedCount = 10 }: HubFooterProps) => (
  <Footer className={styles.root} aria-label="星穹列车页脚">
    <div className={styles.brand}>
      AstralExpress
      <Text className={styles.sub}>YOUR PERSONAL WORKSPACE</Text>
    </div>
    <p className={styles.quote}>
      <StarIcon />
      <Text>愿此行，终抵群星</Text>
      <StarIcon />
    </p>
    <div className={styles.meta}>
      <i />
      <Text>
        {openedCount} 个模块已开放 · {plannedCount} 个筹备中
      </Text>
    </div>
  </Footer>
);
