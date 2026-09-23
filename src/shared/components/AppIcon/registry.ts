import type { ComponentType } from "react";

import {
  AppstoreOutlined,
  AudioOutlined,
  ClockCircleOutlined,
  CloudDownloadOutlined,
  CopyOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DiffOutlined,
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SnippetsOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import type { AntdIconProps } from "./AppIcon";

/**
 * manifest.icon 字段的唯一合法取值来源。
 *
 * - 新增图标：只能从 Ant Design Icons（Outlined 风格）中选取，在此处补充 import 和条目。
 * - 不接受 iconfont、图片路径或自定义 SVG。
 *
 * 当前 Rust 侧的 catalog/manifest_scanner.rs 不校验 icon 取值：manifest 里写了未注册的图标名，
 * 扫描阶段不会报错，只会在前端渲染时降级到 FALLBACK_ICON 并在 DEV 下 console.warn。
 */
export const ANTD_ICON_MAP: Record<string, ComponentType<AntdIconProps>> = {
  AudioOutlined,
  ClockCircleOutlined,
  CloudDownloadOutlined,
  CopyOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DiffOutlined,
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SnippetsOutlined,
  SwapOutlined,
};

/** 未命中或未填写 icon 字段时的兜底图标。 */
export const FALLBACK_ICON: ComponentType<AntdIconProps> = AppstoreOutlined;
