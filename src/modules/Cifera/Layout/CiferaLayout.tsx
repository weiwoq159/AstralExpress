import { useEffect } from "react";
import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { useCrawlerStore } from "@cifera/stores/useCrawlerStore";

import { Cifera } from "../module";
import { CiferaNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(CiferaNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const CiferaLayout = () => {
  const fetchCrawlers = useCrawlerStore((state) => state.fetchCrawlers);
  useEffect(() => {
    void fetchCrawlers().catch((error) => {
      console.error("加载工具列表失败", error);
    });
  }, [fetchCrawlers]);
  return <AppLayout module={Cifera} navigationItems={navigationItems}></AppLayout>;
};
