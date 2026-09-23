import { Button, Flex, Input, Select } from "antd";

import styles from "./CatalogToolbar.module.scss";

const ALL_STATUS = "all";

export type CatalogToolbarStatusOption = { value: string; label: string };

type CatalogToolbarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  statusOptions: readonly CatalogToolbarStatusOption[];
  onStatusChange: (value: string) => void;
  loading: boolean;
  onRefresh: () => void;
};

export const CatalogToolbar = ({
  keyword,
  onKeywordChange,
  status,
  statusOptions,
  onStatusChange,
  loading,
  onRefresh,
}: CatalogToolbarProps) => (
  <Flex gap={10} wrap justify="space-between" className={styles.toolbar}>
    <Flex gap={10} wrap className={styles.filters}>
      <Input.Search
        className={styles.search}
        placeholder="搜索名称、描述或标签"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        allowClear
      />
      <Select
        className={styles.status}
        value={status}
        onChange={onStatusChange}
        options={[{ value: ALL_STATUS, label: "全部状态" }, ...statusOptions]}
      />
    </Flex>
    <Button loading={loading} onClick={onRefresh}>
      刷新
    </Button>
  </Flex>
);
