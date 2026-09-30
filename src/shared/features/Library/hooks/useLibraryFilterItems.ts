import { useMemo } from "react";

import type { Manifest } from "@/shared/domain/manifest";

export type LibraryFilterItem = {
  value: string;
  label: string;
  count: number;
};

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  Data: "数据处理",
  Files: "文件管理",
  Dev: "开发辅助",
  Images: "图片处理",
  Documents: "文档处理",
  Text: "文本处理",
  research: "学术研究",
  download: "资源下载",
  developer: "开发资源",
  news: "新闻资讯",
  website: "网站采集",
  ecommerce: "电商采集",
};

export const useLibraryFilterItems = (items: readonly Manifest[]) => {
  return useMemo(() => {
    const categories = new Map<string, LibraryFilterItem>();

    for (const { category } of items) {
      const item = categories.get(category);
      if (item) {
        item.count += 1;
      } else {
        categories.set(category, {
          value: category,
          label: CATEGORY_LABELS[category] ?? category,
          count: 1,
        });
      }
    }

    return [{ value: "", label: "全部", count: items.length }, ...categories.values()];
  }, [items]);
};
