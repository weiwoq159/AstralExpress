import { Card, Descriptions, Flex } from "antd";

import { getManifestCategoryLabel } from "../../config/category";

import styles from "./ManifestOverview.module.scss";

type ManifestOverviewProps = {
  category: string;
  entry: string;
  tags: readonly string[];
};

export const ManifestOverview = ({ category, entry, tags }: ManifestOverviewProps) => (
  <Card className={styles.card} classNames={{ body: styles.cardBody }}>
    <div className={styles.title}>应用概览</div>
    <Descriptions
      className={styles.descriptions}
      column={1}
      size="small"
      items={[
        { key: "category", label: "分类", children: getManifestCategoryLabel(category) },
        { key: "entry", label: "运行入口", children: entry || "—" },
      ]}
    />
    {tags.length > 0 && (
      <Flex gap={6} wrap className={styles.tags}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </Flex>
    )}
  </Card>
);
