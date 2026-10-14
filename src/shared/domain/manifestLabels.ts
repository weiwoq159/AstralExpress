import type { ManifestStatus } from "./manifest";

/** 应用分类 key 到中文名的映射，顺序即分类栏展示顺序。 */
export const CATEGORY_LABELS: Record<string, string> = {
  Files: "文件管理",
  Text: "文本处理",
  Images: "图片处理",
  Documents: "文档处理",
  Dev: "开发辅助",
  Data: "数据处理",
};

export const STATUS_LABELS: Record<ManifestStatus, string> = {
  available: "可用",
  unavailable: "环境缺失",
  disabled: "已禁用",
};
