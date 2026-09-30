import { Flex, Typography, Input, Select, Button, Alert, Pagination, Spin, Empty } from "antd";

import { GlassCard } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import { statusOptions, type StatusFilter } from "../../config/manifestStatus";
import { CatalogGrid } from "../CatalogGrid/CatalogGrid";

import styles from "./CatalogBrowser.module.scss";
const { Text } = Typography;

interface CatalogBrowserProps {
  title: string;
  description?: string;
  itemLabel: string;
  total: number;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  pageItems: Manifest[];
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  onResetFilters: () => void;
  onRefresh: () => void;
}

export const CatalogBrowser = ({
  title,
  description,
  itemLabel,
  total,
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  pageItems,
  currentPage,
  onPageChange,
  pageSize,
  loading,
  error,
  hasFilters,
  onResetFilters,
  onRefresh,
}: CatalogBrowserProps) => {
  let content;
  if (loading) {
    content = (
      <Flex vertical align="center" gap={14} className={styles.state} role="status">
        <Spin />
        <Text type="secondary">正在加载{itemLabel}…</Text>
      </Flex>
    );
  } else if (error) {
    content = (
      <Flex vertical align="center" gap={14} className={styles.state}>
        <Alert type="error" title="读取失败" description={error} showIcon />
        <Button onClick={onRefresh}>重新加载</Button>
      </Flex>
    );
  } else if (total === 0) {
    content = (
      <Empty
        className={styles.state}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={hasFilters ? `暂无匹配${itemLabel}，请调整筛选条件` : `暂无已收录${itemLabel}`}
      />
    );
  } else {
    content = <CatalogGrid items={pageItems} />;
  }

  return (
    <GlassCard className={styles.card} classNames={{ body: styles.cardBody }}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div>
          <div className={styles.title}>{title}</div>
          {description && <Text className={styles.description}>{description}</Text>}
        </div>
        <span className={styles.total}>筛选结果 {total} 项</span>
      </Flex>
      <Flex vertical gap={16}>
        <Flex gap={10} wrap justify="space-between" className={styles.toolbar}>
          <Flex gap={10} wrap className={styles.filters}>
            <Input
              className={styles.search}
              placeholder="搜索名称、描述或标签"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              allowClear
            />
            <Select<StatusFilter>
              className={styles.status}
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
            />
          </Flex>
          <Flex gap={10}>
            <Button disabled={!hasFilters} onClick={onResetFilters}>
              重置筛选
            </Button>
            <Button loading={loading} onClick={onRefresh}>
              刷新
            </Button>
          </Flex>
        </Flex>
        {content}
        {!loading && !error && (
          <Pagination
            hideOnSinglePage
            align="end"
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        )}
      </Flex>
    </GlassCard>
  );
};
