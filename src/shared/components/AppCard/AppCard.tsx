import { Link, type To } from "react-router";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Divider, Flex, Tag, Typography } from "antd";

import type { Manifest } from "@/shared/domain/manifest";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/shared/domain/manifestLabels";

import { AppIcon } from "../AppIcon/AppIcon";
import { GlassPanel } from "../GlassPanel/GlassPanel";

import styles from "./AppCard.module.scss";

const { Text, Title, Paragraph } = Typography;

type AppCardProps = {
  manifest: Manifest;
  /** 点击卡片后跳转的目标路径。 */
  to: To;
};

export const AppCard = ({ manifest, to }: AppCardProps) => {
  const rootClass = [styles.card, manifest.status === "available" && styles.available].filter(Boolean).join(" ");

  return (
    <Link to={to} className={styles.link} aria-label={`查看${manifest.name}详情`}>
      <GlassPanel hoverable className={rootClass} styles={{ body: { padding: 0 } }}>
        <Flex vertical className={styles.body}>
          <Flex align="center" justify="space-between" gap={8} className={styles.top}>
            <Text className={styles.icon} aria-hidden="true">
              <AppIcon icon={manifest.icon} />
            </Text>
            <Tag bordered={false} className={`${styles.status} ${styles[manifest.status] ?? ""}`}>
              {STATUS_LABELS[manifest.status] ?? manifest.status}
            </Tag>
          </Flex>
          <Title level={3} className={styles.name}>
            {manifest.name}
          </Title>
          <Paragraph type="secondary" ellipsis={{ rows: 2 }} className={styles.description}>
            {manifest.description}
          </Paragraph>
          <Flex wrap gap={4} className={styles.tags}>
            {manifest.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} className={styles.tag}>
                {tag}
              </Tag>
            ))}
          </Flex>
          <Divider className={styles.divider} />
          <Flex align="center" justify="space-between" gap={8} className={styles.bottom}>
            <Text type="secondary" className={styles.meta}>
              {CATEGORY_LABELS[manifest.category] ?? manifest.category}
              <span className={styles.dot}>·</span>
              {manifest.isQueue ? "队列任务" : "即时运行"}
            </Text>
            <Text className={styles.open}>
              详情 <ArrowRightOutlined />
            </Text>
          </Flex>
        </Flex>
      </GlassPanel>
    </Link>
  );
};
