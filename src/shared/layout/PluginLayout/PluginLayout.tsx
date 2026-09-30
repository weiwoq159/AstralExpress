import { useEffect } from "react";
import { Link } from "react-router";

import type { ModuleDefinition } from "@/shared/domain/module-definition";

import { AppLayout } from "../AppLayout/AppLayout";

type PluginLayoutProps = {
  module: ModuleDefinition;
  navigation: Readonly<Record<string, { path: string; title: string }>>;
  loadManifests: () => Promise<unknown>;
  loadTasks: () => Promise<unknown>;
};

export const PluginLayout = ({ module, navigation, loadManifests, loadTasks }: PluginLayoutProps) => {
  useEffect(() => {
    void loadManifests().catch((error) => console.error("加载插件列表失败", error));
  }, [loadManifests]);

  useEffect(() => {
    void loadTasks().catch((error) => console.error("加载任务队列失败", error));
  }, [loadTasks]);

  const navigationItems = Object.values(navigation).map(({ path, title }) => ({
    key: path,
    label: <Link to={path}>{title}</Link>,
  }));

  return <AppLayout module={module} navigationItems={navigationItems} />;
};
