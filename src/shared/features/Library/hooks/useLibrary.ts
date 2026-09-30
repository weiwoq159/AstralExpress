import { useMemo, useState } from "react";

import { useStore, type StoreApi } from "zustand";

import type { Manifest } from "@/shared/domain/manifest";
import type { ListStore } from "@/shared/stores/createListStore";

import type { StatusFilter } from "../config/manifestStatus";
import { useLibraryFilterItems } from "./useLibraryFilterItems";

const pageSize = 8;

export const useLibrary = (store: StoreApi<ListStore<Manifest>>) => {
  const items = useStore(store, (state) => state.items);
  const loading = useStore(store, (state) => state.loading);
  const error = useStore(store, (state) => state.error);
  const fetchItems = useStore(store, (state) => state.fetchItems);
  const [currentCategory, setCurrentCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const filterItems = useLibraryFilterItems(items);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (status && item.status !== status) return false;
      if (currentCategory && item.category !== currentCategory) return false;

      return item.name.includes(keyword) || item.description.includes(keyword) || item.tags.includes(keyword);
    });
  }, [items, status, currentCategory, keyword]);

  const total = filteredItems.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, currentPage), maxPage);
  const start = (page - 1) * pageSize;
  const pageItems = filteredItems.slice(start, start + pageSize);
  const hasFilters = Boolean(currentCategory || keyword || status);

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const handleKeywordChange = (keyword: string) => {
    setKeyword(keyword);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatus(status);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setCurrentCategory("");
    setKeyword("");
    setStatus("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    void fetchItems();
  };

  return {
    currentCategory,
    keyword,
    status,
    page,
    pageSize,
    pageItems,
    total,
    filterItems,
    hasFilters,
    loading,
    error,
    onCategoryChange: handleCategoryChange,
    onKeywordChange: handleKeywordChange,
    onStatusChange: handleStatusChange,
    onPageChange: setCurrentPage,
    onResetFilters: handleResetFilters,
    onRefresh: handleRefresh,
  };
};

export type LibraryState = ReturnType<typeof useLibrary>;
