import { Row, Col } from "antd";

import { Hero } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { CatalogFilter, CatalogBrowser } from "./components";
import type { LibraryState } from "./hooks/useLibrary";

import styles from "./Library.module.scss";

const featureTags = ["应用索引", "分类筛选", "状态追踪"];

interface LibraryProps {
  library: LibraryState;
  itemLabel?: string;
}

export const Library = ({ library, itemLabel = "工具" }: LibraryProps) => {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <Hero
        eyebrow="APPLICATION LIBRARY"
        title="应用库"
        description="集中浏览和管理已收录的应用、工具与功能入口。"
        tags={featureTags}
      />
      <Row gutter={[24, 24]} className={styles.content}>
        <Col span={6} className={styles.column}>
          <CatalogFilter
            noteTitle={`${itemLabel}注册表`}
            note={`分类数量为全部已收录${itemLabel}数。可结合关键词和状态筛选，右侧显示筛选结果数。`}
            items={library.filterItems}
            value={library.currentCategory}
            onChange={library.onCategoryChange}
          />
        </Col>
        <Col span={18} className={styles.column}>
          <CatalogBrowser
            keyword={library.keyword}
            onKeywordChange={library.onKeywordChange}
            status={library.status}
            onStatusChange={library.onStatusChange}
            title={`${itemLabel}注册表`}
            description={`已收录的${itemLabel}列表，按分类筛选。`}
            itemLabel={itemLabel}
            total={library.total}
            pageItems={library.pageItems}
            currentPage={library.page}
            onPageChange={library.onPageChange}
            pageSize={library.pageSize}
            loading={library.loading}
            error={library.error}
            hasFilters={library.hasFilters}
            onResetFilters={library.onResetFilters}
            onRefresh={library.onRefresh}
          />
        </Col>
      </Row>
    </div>
  );
};
