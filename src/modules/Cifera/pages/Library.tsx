import { useMemo } from "react";

import { Col, Row } from "antd";

import { CatalogBrowser, CatalogFilter, OverviewCards } from "@/catalog/components";
import { manifestStatusOptions } from "@/catalog/config/manifestStatus";
import { useManifestCatalog } from "@/catalog/hooks";
import { toCatalogGridItem } from "@/catalog/utils";
import { Hero } from "@/shared/components";
import styles from "@/shared/styles/Page.module.scss";

import { ciferaNavigation } from "../navigation";
import { useCrawlerStore } from "../stores/useCrawlerStore";
import layoutStyles from "./Library.module.scss";

const featureTags = ["方案索引", "分类筛选", "状态追踪"];

export const Library = () => {
  const crawlers = useCrawlerStore((state) => state.items);
  const loading = useCrawlerStore((state) => state.loading);
  const error = useCrawlerStore((state) => state.error);
  const loadCrawlers = useCrawlerStore((state) => state.load);

  const catalog = useManifestCatalog(crawlers);

  const overviewItems = useMemo(
    () => [
      { key: "total", label: "已收录方案", value: crawlers.length, description: "集中收录的采集方案" },
      {
        key: "available",
        label: "当前可用",
        value: crawlers.filter((crawler) => crawler.status === "available").length,
        description: "已标记为可用的采集方案",
      },
      { key: "categories", label: "能力分类", value: catalog.categoryOptions.length - 1, description: "按用途归档与筛选" },
    ],
    [crawlers, catalog.categoryOptions],
  );

  return (
    <div className={`${styles.page} ${layoutStyles.layout}`}>
      <Hero
        eyebrow="SCHEME LIBRARY"
        title="方案库"
        description="集中浏览和管理已收录的采集方案与执行入口。"
        tags={featureTags}
      />

      <section aria-label="方案库概览" style={{ marginTop: 24 }}>
        <OverviewCards items={overviewItems} />
      </section>

      <Row gutter={[24, 24]} align="stretch" className={layoutStyles.row}>
        <Col xs={24} lg={6}>
          <CatalogFilter
            title="分类筛选"
            description="按方案用途快速定位已收录的能力。"
            ariaLabel="方案分类"
            value={catalog.category}
            onChange={catalog.setCategory}
            options={catalog.categoryOptions}
            noteTitle="方案注册表"
            note="选择分类缩小范围，也可结合关键词和方案状态筛选。"
          />
        </Col>
        <Col xs={24} lg={18}>
          <CatalogBrowser
            title="已收录方案"
            description="方案入口与本地能力的统一索引。"
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
            onRefresh={() => void loadCrawlers()}
            error={error}
            items={catalog.pagedManifests.map((manifest) => ({
              ...toCatalogGridItem(manifest),
              link: `${ciferaNavigation.library.path}/${manifest.key}`,
            }))}
            emptyText="没有匹配的方案"
          />
        </Col>
      </Row>
    </div>
  );
};
