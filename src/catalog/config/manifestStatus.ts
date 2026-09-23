import type { ManifestStatus } from "@/shared/domain/manifest";

export const manifestStatusLabel: Record<ManifestStatus, string> = {
  available: "可用",
  disabled: "已禁用",
  unavailable: "不可用",
};

export const manifestStatusTone: Record<ManifestStatus, "positive" | "neutral" | "negative"> = {
  available: "positive",
  disabled: "neutral",
  unavailable: "negative",
};

export const manifestStatusOptions: { value: ManifestStatus; label: string }[] = (
  Object.keys(manifestStatusLabel) as ManifestStatus[]
).map((value) => ({ value, label: manifestStatusLabel[value] }));
