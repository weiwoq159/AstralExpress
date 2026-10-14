export type DedupMode = "exact" | "similar";

export interface ImageDedupConfig {
  directory: string;
  recursive: boolean;
  mode: DedupMode;
  formats: string[];
}

export const DEDUP_MODES: { value: DedupMode; label: string; description: string; disabled?: boolean }[] = [
  { value: "exact", label: "内容完全相同", description: "比较图片内容，找出完全一致的文件。" },
  { value: "similar", label: "视觉相似", description: "暂未开放", disabled: true },
];

export const DEDUP_MODE_LABELS: Record<DedupMode, string> = {
  exact: "内容完全相同",
  similar: "视觉相似",
};

export const DEDUP_FORMATS = [
  { value: "JPG", label: "JPG / JPEG" },
  { value: "PNG", label: "PNG" },
  { value: "WebP", label: "WebP" },
  { value: "HEIC", label: "HEIC" },
];
