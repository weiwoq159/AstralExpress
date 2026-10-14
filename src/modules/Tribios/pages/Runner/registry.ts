import type { ComponentType } from "react";

import type { Manifest } from "@/shared/domain/manifest";

import { BatchRename, ImageDedup } from "./components";

/** manifest key → 该应用的 Runner 页面。新增应用在此登记。 */
export const RUNNER_PAGES: Record<string, ComponentType<{ manifest: Manifest }> | undefined> = {
  "batch-rename": BatchRename,
  "image-dedup": ImageDedup,
};
