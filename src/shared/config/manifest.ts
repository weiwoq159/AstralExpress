import type { ManifestStatus } from "@/shared/domain/manifest";

export type ManifestPresentation = {
  label: string;
  tone: ManifestStatus;
};

export const manifestStatusPresentation: Record<ManifestStatus, ManifestPresentation> = {
  available: { label: "可用", tone: "available" },
  disabled: { label: "已禁用", tone: "disabled" },
  unavailable: { label: "环境缺失", tone: "unavailable" },
};

const manifestCategoryLabel: Readonly<Record<string, string>> = {
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
  mhxy: "梦幻西游采集",
};

export const getManifestCategoryLabel = (category: string): string => manifestCategoryLabel[category] ?? category;
