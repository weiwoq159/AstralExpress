import { useEffect } from "react";
import { Link } from "react-router";

import type { MenuProps } from "antd";

import { useMount } from "ahooks";

import { ModuleShell } from "@/shared/layout";
import { onTaskChanged } from "@/shared/tauri/events";

import { Tools } from "./module";
import { toolsNavigation } from "./navigation";
import { useTaskStore } from "./stores/useTaskStore";
import { useToolStore } from "./stores/useToolStore";

const navigationItems: MenuProps["items"] = Object.values(toolsNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const ToolsLayout = () => {
  const loadTools = useToolStore((state) => state.load);
  const loadTasks = useTaskStore((state) => state.load);
  useMount(() => {
    loadTools();
    loadTasks();
  });
  // 任务在后台跑的时候（进度更新、成功/失败）需要实时反映到任务队列上，不能只靠
  // 用户手动点刷新——订阅 Rust 侧的 task-changed 事件，收到就重新拉一次任务列表。
  useEffect(() => onTaskChanged(() => loadTasks()), [loadTasks]);

  return <ModuleShell module={Tools} navigationItems={navigationItems} />;
};
