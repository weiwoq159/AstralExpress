import { useEffect } from "react";
import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { useToolStore } from "@tribios/stores/useToolStore";

import { Tribios } from "../module";
import { TribiosNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(TribiosNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const TribiosLayout = () => {
  const fetchTools = useToolStore((state) => state.fetchTools);
  useEffect(() => {
    void fetchTools().catch((error) => {
      console.error("加载工具列表失败", error);
    });
  }, [fetchTools]);
  return <AppLayout module={Tribios} navigationItems={navigationItems}></AppLayout>;
};
