import { Alert, Button, Flex } from "antd";

import { CatalogGrid, type CatalogGridItem } from "../CatalogGrid/CatalogGrid";
import { CatalogPanel } from "../CatalogPanel/CatalogPanel";
import { CatalogToolbar, type CatalogToolbarStatusOption } from "../CatalogToolbar/CatalogToolbar";

import styles from "./CatalogBrowser.module.scss";

type CatalogBrowserProps = {
  title: string;
  description?: string;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  statusOptions: readonly CatalogToolbarStatusOption[];
  onStatusChange: (value: string) => void;
  loading: boolean;
  onRefresh: () => void;
  error?: string;
  items: readonly CatalogGridItem[];
  emptyText?: string;
};

/** CatalogPanel + CatalogToolbar + CatalogGrid 的组合，用于"筛选并浏览一份 manifest 清单"这类页面。 */
export const CatalogBrowser = ({
  title,
  description,
  total,
  page,
  pageSize,
  onPageChange,
  keyword,
  onKeywordChange,
  status,
  statusOptions,
  onStatusChange,
  loading,
  onRefresh,
  error,
  items,
  emptyText,
}: CatalogBrowserProps) => (
  <CatalogPanel
    title={title}
    description={description}
    total={total}
    page={page}
    pageSize={pageSize}
    onPageChange={onPageChange}
  >
    <Flex vertical gap={16}>
      <CatalogToolbar
        keyword={keyword}
        onKeywordChange={onKeywordChange}
        status={status}
        statusOptions={statusOptions}
        onStatusChange={onStatusChange}
        loading={loading}
        onRefresh={onRefresh}
      />
      {error ? (
        <Flex vertical align="center" gap={14} className={styles.errorState}>
          <Alert type="error" message="读取失败" description={error} showIcon />
          <Button onClick={onRefresh}>重新加载</Button>
        </Flex>
      ) : (
        <CatalogGrid items={items} emptyText={emptyText} />
      )}
    </Flex>
  </CatalogPanel>
);
