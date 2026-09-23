import type { ReactNode } from "react";

import { Button, Card, Divider, Typography } from "antd";

import styles from "./CatalogFilter.module.scss";

export type CatalogFilterOption = {
  value: string;
  label: string;
  count: number;
};

type CatalogFilterProps = {
  title: string;
  description?: string;
  ariaLabel: string;
  options: readonly CatalogFilterOption[];
  value: string;
  onChange: (value: string) => void;
  noteTitle?: string;
  note?: string;
  /** 分类列表之外的附加筛选控件，例如按站点/标签筛选。未提供时不渲染。 */
  children?: ReactNode;
};

export const CatalogFilter = ({
  title,
  description,
  ariaLabel,
  options,
  value,
  onChange,
  noteTitle,
  note,
  children,
}: CatalogFilterProps) => (
  <Card className={styles.card} classNames={{ body: styles.cardBody }}>
    <Typography.Title level={5} className={styles.title}>
      {title}
    </Typography.Title>
    {description && (
      <Typography.Text type="secondary" className={styles.description}>
        {description}
      </Typography.Text>
    )}
    <nav className={styles.navigation} aria-label={ariaLabel}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="text"
          block
          className={styles.button}
          data-active={option.value === value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          <span className={styles.count}>{option.count}</span>
        </Button>
      ))}
    </nav>
    {children}
    {note && (
      <>
        <Divider className={styles.divider} />
        <aside className={styles.note} aria-label="筛选说明">
          {noteTitle && (
            <Typography.Text strong className={styles.noteTitle}>
              {noteTitle}
            </Typography.Text>
          )}
          <Typography.Text className={styles.noteText}>{note}</Typography.Text>
        </aside>
      </>
    )}
  </Card>
);
