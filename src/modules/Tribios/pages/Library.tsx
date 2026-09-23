import { useMemo } from "react";

import { Col, Row } from "antd";

import { CatalogBrowser, CatalogFilter, OverviewCards } from "@/catalog/components";
import { manifestStatusOptions } from "@/catalog/config/manifestStatus";
import { useManifestCatalog } from "@/catalog/hooks";
import { toCatalogGridItem } from "@/catalog/utils";
import { Hero } from "@/shared/components";
import styles from "@/shared/styles/Page.module.scss";

import { toolsNavigation } from "../navigation";
import { useToolStore } from "../stores/useToolStore";
import layoutStyles from "./Library.module.scss";

const featureTags = ["应用索引", "分类筛选", "状态追踪"];

export const Library = () => {
  const tools = useToolStore((state) => state.items);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const loadTools = useToolStore((state) => state.load);

  const catalog = useManifestCatalog(tools);

  const overviewItems = useMemo(
    () => [
      { key: "total", label: "已收录应用", value: tools.length, description: "集中收录的工具与功能入口" },
      {
        key: "available",
        label: "当前可用",
        value: tools.filter((tool) => tool.status === "available").length,
        description: "已标记为可用的应用",
      },
      { key: "categories", label: "能力分类", value: catalog.categoryOptions.length - 1, description: "按用途归档与筛选" },
    ],
    [tools, catalog.categoryOptions],
  );

  return (
    <div className={`${styles.page} ${layoutStyles.layout}`}>
      <Hero
        eyebrow="APPLICATION LIBRARY"
        title="应用库"
        description="集中浏览和管理已收录的应用、工具与功能入口。"
        tags={featureTags}
      />

      <section aria-label="应用库概览" style={{ marginTop: 24 }}>
        <OverviewCards items={overviewItems} />
      </section>

      <Row gutter={[24, 24]} align="stretch" className={layoutStyles.row}>
        <Col xs={24} lg={6}>
          <CatalogFilter
            title="分类筛选"
            description="按工具用途快速定位已收录的功能。"
            ariaLabel="工具分类"
            value={catalog.category}
            onChange={catalog.setCategory}
            options={catalog.categoryOptions}
            noteTitle="工具注册表"
            note="选择分类缩小范围，也可结合关键词和工具状态筛选。"
          />
        </Col>
        <Col xs={24} lg={18}>
          <CatalogBrowser
            title="已收录应用"
            description="应用入口与本地能力的统一索引。"
            total={catalog.total}
            page={catalog.page}
            pageSize={catalog.pageSize}
            onPageChange={catalog.setPage}
            keyword={catalog.keyword}
            onKeywordChange={catalog.setKeyword}
            status={catalog.status}
            statusOptions={manifestStatusOptions}
            onStatusChange={catalog.setStatus}
            loading={loading}
            onRefresh={() => void loadTools()}
            error={error}
            items={catalog.pagedManifests.map((manifest) => ({
              ...toCatalogGridItem(manifest),
              link: `${toolsNavigation.library.path}/${manifest.key}`,
            }))}
            emptyText="没有匹配的应用"
          />
        </Col>
      </Row>
    </div>
  );
};
