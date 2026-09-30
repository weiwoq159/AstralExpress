import { type ReactNode } from "react";

import { Button, Divider, Typography } from "antd";

import { GlassCard } from "@/shared/components";

import type { LibraryFilterItem } from "../../hooks/useLibraryFilterItems";

import styles from "./CatalogFilter.module.scss";

interface CatalogFilterProps {
  children?: ReactNode;
  note?: string;
  noteTitle?: string;
  items: readonly LibraryFilterItem[];
  value: string;
  onChange: (category: string) => void;
}

export const CatalogFilter = (props: CatalogFilterProps) => {
  const { children, note, noteTitle, items, value, onChange } = props;

  return (
    <GlassCard className={styles.card} classNames={{ body: styles.cardBody }}>
      <Typography.Title level={5} className={styles.title}>
        分类筛选
      </Typography.Title>
      <Typography.Text type="secondary" className={styles.description}>
        根据应用分类进行筛选
      </Typography.Text>
      <nav className={styles.navigation}>
        {items.map((item) => (
          <Button
            key={item.value}
            type="text"
            block
            className={styles.button}
            data-active={item.value === value}
            aria-pressed={item.value === value}
            onClick={() => onChange(item.value)}
          >
            <span>{item.label}</span>
            <span className={styles.count}>{item.count}</span>
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
    </GlassCard>
  );
};
