export type RenameMode = "prefix" | "suffix" | "replace" | "sequence";

export interface BatchRenameConfig {
  directory: string;
  mode: RenameMode;
  prefix: string;
  suffix: string;
  search: string;
  replaceWith: string;
  sequenceStart: number;
  sequencePadding: number;
}

export const RENAME_MODE_LABELS: Record<RenameMode, string> = {
  prefix: "添加前缀",
  suffix: "添加后缀",
  replace: "查找替换",
  sequence: "序号命名",
};
