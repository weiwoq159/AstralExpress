import type { ManifestStatus } from "@/shared/domain/manifest";

type ManifestTone = "available" | "disabled" | "unavailable";

type ManifestPresentation = {
  label: string;
  tone: ManifestTone;
  /** 状态不可用时按钮上显示的兜底文案。 */
  actionLabel: string;
};

export const manifestStatusPresentation: Record<ManifestStatus, ManifestPresentation> = {
  available: { label: "可用", tone: "available", actionLabel: "运行" },
  disabled: { label: "已禁用", tone: "disabled", actionLabel: "已禁用" },
  unavailable: { label: "环境缺失", tone: "unavailable", actionLabel: "环境缺失" },
};
