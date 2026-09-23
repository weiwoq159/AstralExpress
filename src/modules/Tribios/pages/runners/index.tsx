import type { ComponentType } from "react";

import type { Manifest } from "@/shared/domain/manifest";

import { BatchRenameRunner } from "./BatchRename/BatchRenameRunner";

export type RunnerComponent = ComponentType<{ tool: Manifest }>;

/** manifest key -> 对应的运行界面。查不到时上层渲染兜底态，不是每个工具都要求接入。 */
export const runnerRegistry: Record<string, RunnerComponent> = {
  "batch-rename": BatchRenameRunner,
};
