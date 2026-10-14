import type { ComponentType } from "react";

import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  CameraOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  CompressOutlined,
  CopyOutlined,
  DatabaseOutlined,
  DiffOutlined,
  DownloadOutlined,
  EditOutlined,
  ExpandOutlined,
  ExportOutlined,
  FieldNumberOutlined,
  FileAddOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  FunnelPlotOutlined,
  GithubOutlined,
  GlobalOutlined,
  HighlightOutlined,
  Html5Outlined,
  IdcardOutlined,
  IssuesCloseOutlined,
  LineChartOutlined,
  LinkOutlined,
  MergeCellsOutlined,
  NotificationOutlined,
  PictureOutlined,
  PieChartOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ScissorOutlined,
  SearchOutlined,
  SelectOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TableOutlined,
  TagOutlined,
  TagsOutlined,
} from "@ant-design/icons";

import type { AntdIconProps } from "./AppIcon";

/** iconfont（阿里图标库）图标的 type 前缀，用于和 Ant Design 图标名区分。 */
export const ICONFONT_PREFIX = "icon-";

/**
 * manifest.icon 字段的合法取值来源。
 *
 * - 优先从 Ant Design Icons（Outlined 风格）中选取，在此处补充 import 和条目。
 * - 也可使用 iconfont 图标：取值以 `icon-` 开头，交由 AppIcon 内的 IconFont 渲染，不在本文件注册。
 * - 不接受图片路径或自定义 SVG。
 *
 * 当前 Rust 侧的 catalog/manifest_scanner.rs 不校验 icon 取值：manifest 里写了未注册的图标名，
 * 扫描阶段不会报错，只会在前端渲染时降级到 FALLBACK_ICON 并在 DEV 下 console.warn。
 */
export const ANTD_ICON_MAP: Record<string, ComponentType<AntdIconProps>> = {
  ApartmentOutlined,
  BookOutlined,
  CalendarOutlined,
  CameraOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  CompressOutlined,
  CopyOutlined,
  DatabaseOutlined,
  DiffOutlined,
  DownloadOutlined,
  EditOutlined,
  ExpandOutlined,
  ExportOutlined,
  FieldNumberOutlined,
  FileAddOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  FunnelPlotOutlined,
  GithubOutlined,
  GlobalOutlined,
  HighlightOutlined,
  Html5Outlined,
  IdcardOutlined,
  IssuesCloseOutlined,
  LineChartOutlined,
  LinkOutlined,
  MergeCellsOutlined,
  NotificationOutlined,
  PictureOutlined,
  PieChartOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ScissorOutlined,
  SearchOutlined,
  SelectOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TableOutlined,
  TagOutlined,
  TagsOutlined,
};

/** 未命中或未填写 icon 字段时的兜底图标。 */
export const FALLBACK_ICON: ComponentType<AntdIconProps> = AppstoreOutlined;
