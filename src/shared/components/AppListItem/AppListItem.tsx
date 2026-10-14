import { Link, type To } from "react-router";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Flex, Tag, Typography } from "antd";

import type { Manifest } from "@/shared/domain/manifest";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/shared/domain/manifestLabels";

import { AppIcon } from "../AppIcon/AppIcon";
import { GlassPanel } from "../GlassPanel/GlassPanel";

import styles from "./AppListItem.module.scss";

const { Text, Title, Paragraph } = Typography;

type AppListItemProps = {
  manifest: Manifest;
  /** 点击后跳转的目标路径。 */
  to: To;
};

/** 应用库「列表视图」下的单行应用条目；卡片视图见 AppCard。 */
export const AppListItem = ({ manifest, to }: AppListItemProps) => {
  const rootClass = [styles.item, manifest.status === "available" && styles.available].filter(Boolean).join(" ");

  return (
    <Link to={to} className={styles.link} aria-label={`查看${manifest.name}详情`}>
      <GlassPanel hoverable className={rootClass} styles={{ body: { padding: 0 } }}>
        <Flex align="center" gap={24} className={styles.body}>
          <Flex align="center" gap={12} className={styles.lead}>
            <Text className={styles.icon} aria-hidden="true">
              <AppIcon icon={manifest.icon} />
            </Text>
            <Tag bordered={false} className={`${styles.status} ${styles[manifest.status] ?? ""}`}>
              {STATUS_LABELS[manifest.status] ?? manifest.status}
            </Tag>
          </Flex>
          <Flex vertical flex={1} className={styles.main}>
            <Title level={3} className={styles.name}>
              {manifest.name}
            </Title>
            <Paragraph type="secondary" ellipsis={{ rows: 1 }} className={styles.description}>
              {manifest.description}
            </Paragraph>
            <Flex wrap gap={4} className={styles.tags}>
              {manifest.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} className={styles.tag}>
                  {tag}
                </Tag>
              ))}
            </Flex>
          </Flex>
          <Flex vertical align="flex-end" gap={16} className={styles.aside}>
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
