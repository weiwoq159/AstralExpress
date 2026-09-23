import { useMemo, useReducer } from "react";

import type { Manifest } from "@/shared/domain/manifest";

import { getManifestCategoryLabel } from "../config/category";

const ALL_CATEGORY = "all";
const ALL_STATUS = "all";
const DEFAULT_PAGE_SIZE = 8;

export type CatalogCategoryOption = { value: string; label: string; count: number };

type FilterState = {
  keyword: string;
  category: string;
  status: string;
  page: number;
};

type FilterAction =
  | { type: "keyword"; value: string }
  | { type: "category"; value: string }
  | { type: "status"; value: string }
  | { type: "page"; value: number };

const initialState: FilterState = { keyword: "", category: ALL_CATEGORY, status: ALL_STATUS, page: 1 };

// 改分类/状态/关键词都要连带把页码重置到第 1 页，这条不变量在这里写一次，
// 调用方不用记着每次手动 setPage(1)。
const reduce = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case "keyword":
      return { ...state, keyword: action.value, page: 1 };
    case "category":
      return { ...state, category: action.value, page: 1 };
    case "status":
      return { ...state, status: action.value, page: 1 };
    case "page":
      return { ...state, page: action.value };
  }
};

type UseManifestCatalogOptions = { pageSize?: number };

/** 对一份 manifest 列表做分类/状态/关键词筛选与分页，跟具体是哪个模块无关。 */
export const useManifestCatalog = (manifests: readonly Manifest[], options: UseManifestCatalogOptions = {}) => {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const [state, dispatch] = useReducer(reduce, initialState);

  const categoryOptions = useMemo<CatalogCategoryOption[]>(() => {
    const counts = new Map<string, number>();
    for (const manifest of manifests) {
      counts.set(manifest.category, (counts.get(manifest.category) ?? 0) + 1);
    }
    return [
      { value: ALL_CATEGORY, label: "全部分类", count: manifests.length },
      ...[...counts.entries()].map(([value, count]) => ({ value, label: getManifestCategoryLabel(value), count })),
    ];
  }, [manifests]);

  const filteredManifests = useMemo(() => {
    const keywordLower = state.keyword.trim().toLowerCase();
    return manifests.filter((manifest) => {
      if (state.category !== ALL_CATEGORY && manifest.category !== state.category) return false;
      if (state.status !== ALL_STATUS && manifest.status !== state.status) return false;
      if (!keywordLower) return true;
      const haystack = [manifest.name, manifest.description, ...manifest.tags].join(" ").toLowerCase();
      return haystack.includes(keywordLower);
    });
  }, [manifests, state.category, state.status, state.keyword]);

  const pagedManifests = useMemo(() => {
    const start = (state.page - 1) * pageSize;
    return filteredManifests.slice(start, start + pageSize);
  }, [filteredManifests, state.page, pageSize]);

  return {
    keyword: state.keyword,
    category: state.category,
    status: state.status,
    page: state.page,
    pageSize,
    total: filteredManifests.length,
    categoryOptions,
    pagedManifests,
    setKeyword: (value: string) => dispatch({ type: "keyword", value }),
    setCategory: (value: string) => dispatch({ type: "category", value }),
    setStatus: (value: string) => dispatch({ type: "status", value }),
    setPage: (value: number) => dispatch({ type: "page", value }),
  };
};
