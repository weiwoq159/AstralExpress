import { useState } from "react";

import { AppstoreOutlined, SearchOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Checkbox, Empty, Flex, Input, Pagination, Row, Col, Segmented, Select, Typography } from "antd";

import { Hero, AppCard, AppListItem, SectionHeader } from "@/shared/components";
import { CATEGORY_LABELS } from "@/shared/domain/manifestLabels";
import { useManifests } from "@/shared/hooks/useManifest";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";

import styles from "./Library.module.scss";

const { Text } = Typography;

const PAGE_SIZE = 12;
const ALL = "all";

type SortKey = "order" | "name" | "status";
type ViewMode = "grid" | "list";
type RunMode = typeof ALL | "instant" | "queue";

const RUN_MODE_OPTIONS = [
  { value: ALL, label: "全部类型" },
  { value: "instant", label: "即时应用" },
  { value: "queue", label: "队列应用" },
];

const SORT_OPTIONS = [
  { value: "order", label: "默认排序" },
  { value: "name", label: "名称排序" },
  { value: "status", label: "可用优先" },
];

const getDetailPath = (key: string) => `${TribiosNavigation.library.path}/${encodeURIComponent(key)}`;

export const Library = () => {
  const { manifests } = useManifests("tool");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(ALL);
  const categories = [
    { key: ALL, label: "全部应用", count: manifests.length },
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      key,
      label,
      count: manifests.filter((manifest) => manifest.category === key).length,
    })),
  ];
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [runMode, setRunMode] = useState<RunMode>(ALL);
  const [sort, setSort] = useState<SortKey>("order");
  const [view, setView] = useState<ViewMode>("grid");

  const keyword = search.trim().toLowerCase();
  const filteredManifests = manifests
    .filter(
      (manifest) =>
        (category === ALL || manifest.category === category) &&
        (runMode === ALL || manifest.isQueue === (runMode === "queue")) &&
        (!availableOnly || manifest.status === "available") &&
        [manifest.name, manifest.description, manifest.key, ...manifest.tags].join(" ").toLowerCase().includes(keyword),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "zh-CN");
      if (sort === "status") return Number(b.status === "available") - Number(a.status === "available") || a.order - b.order;
      return a.order - b.order;
    });
  const pagedManifests = filteredManifests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = search !== "" || category !== ALL || availableOnly || runMode !== ALL || sort !== "order";
  const handleCategoryChange = (key: string) => {
    setCategory(key);
    setPage(1);
  };
  const resetFilters = () => {
    setCategory(ALL);
    setSearch("");
    setAvailableOnly(false);
    setRunMode(ALL);
    setSort("order");
    setPage(1);
  };
  const categoryCount = new Set(manifests.map((manifest) => manifest.category)).size;
  const availableCount = manifests.filter((manifest) => manifest.status === "available").length;

  return (
    <Flex vertical>
      <Hero
        eyebrow={`APPLICATION LIBRARY / ${Tribios.title}`}
        title="应用库"
        description="让繁琐有序，让灵感自由。找到此刻需要的那一个工具。"
        cover={Tribios.cover}
      >
        <Flex wrap className={styles.heroStats} aria-label="应用库概览">
          <Flex align="baseline" className={styles.stat}>
            <Text strong className={styles.statValue}>
              {manifests.length}
            </Text>
            <Text>个应用</Text>
          </Flex>
          <Flex align="baseline" className={styles.stat}>
            <Text strong className={styles.statValue}>
              {categoryCount}
            </Text>
            <Text>个分类</Text>
          </Flex>
          <Flex align="baseline" className={styles.stat}>
            <Text strong className={styles.statValue}>
              {availableCount}
            </Text>
            <Text>个可用</Text>
          </Flex>
        </Flex>
      </Hero>
      <Flex align="center" justify="space-between" gap={16} wrap className={styles.toolbar}>
        <Input
          allowClear
          className={styles.search}
          prefix={<SearchOutlined />}
          placeholder="搜索应用名称、简介或标签…"
          aria-label="搜索应用"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Flex align="center" gap={16}>
          <Checkbox
            checked={availableOnly}
            onChange={(event) => {
              setAvailableOnly(event.target.checked);
              setPage(1);
            }}
          >
            仅显示可用应用
          </Checkbox>
          <Select
            value={runMode}
            options={RUN_MODE_OPTIONS}
            aria-label="应用类型"
            className={styles.sort}
            onChange={(value) => {
              setRunMode(value);
              setPage(1);
            }}
          />
          <Select
            value={sort}
            options={SORT_OPTIONS}
            aria-label="排序方式"
            className={styles.sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          />
          <Segmented<ViewMode>
            className={styles.viewSwitch}
            value={view}
            aria-label="视图"
            onChange={setView}
            options={[
              { value: "grid", icon: <AppstoreOutlined />, title: "卡片视图" },
              { value: "list", icon: <UnorderedListOutlined />, title: "列表视图" },
            ]}
          />
        </Flex>
      </Flex>
      <Flex className={styles.categories} role="tablist" aria-label="应用分类">
        {categories.map(({ key, label, count }) => (
          <Button
            key={key}
            type={category === key ? "primary" : "text"}
            role="tab"
            aria-selected={category === key}
            className={styles.category}
            onClick={() => handleCategoryChange(key)}
          >
            {label}
            <span className={styles.count}>{count}</span>
          </Button>
        ))}
      </Flex>
      <Flex align="center" justify="space-between">
        <SectionHeader sectionTitle={category === ALL ? "全部应用" : CATEGORY_LABELS[category]} style={{ margin: "16px 0" }} />
        <Flex align="center" gap={16}>
          <Text type="secondary" aria-live="polite">
            共 {filteredManifests.length} 个
          </Text>
          {isFiltered && (
            <Button type="link" size="small" onClick={resetFilters}>
              重置筛选
            </Button>
          )}
        </Flex>
      </Flex>
      {filteredManifests.length === 0 ? (
        <Empty description="没有找到匹配的应用，试试其他关键词或清除筛选条件">
          <Button type="primary" onClick={resetFilters}>
            查看全部应用
          </Button>
        </Empty>
      ) : view === "grid" ? (
        <Row gutter={[24, 24]}>
          {pagedManifests.map((manifest) => (
            <Col span={6} key={manifest.key}>
              <AppCard manifest={manifest} to={getDetailPath(manifest.key)} />
            </Col>
          ))}
        </Row>
      ) : (
        <Flex vertical gap={8}>
          {pagedManifests.map((manifest) => (
            <AppListItem key={manifest.key} manifest={manifest} to={getDetailPath(manifest.key)} />
          ))}
        </Flex>
      )}
      {filteredManifests.length > PAGE_SIZE && (
        <Flex justify="flex-end" style={{ marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={filteredManifests.length}
            showSizeChanger={false}
            onChange={setPage}
          />
        </Flex>
      )}
    </Flex>
  );
};
