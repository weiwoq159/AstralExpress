import type { ManifestStatus } from "@/shared/domain/manifest";

export type StatusFilter = ManifestStatus | "";

export const manifestStatusConfig = {
  available: { label: "可用", tone: "positive" },
  disabled: { label: "已禁用", tone: "neutral" },
  unavailable: { label: "不可用", tone: "negative" },
} satisfies Record<ManifestStatus, { label: string; tone: "positive" | "neutral" | "negative" }>;

export const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "全部状态" },
  ...Object.entries(manifestStatusConfig).map(([value, { label }]) => ({
    value: value as ManifestStatus,
    label,
  })),
];
