import { useMemo } from "react";

import type { Manifest } from "@/shared/domain/manifest";

/** 根据当前模块的清单生成名称索引，避免另行维护静态 key/name 对照表。 */
export const useManifestNameMap = (manifests: readonly Pick<Manifest, "key" | "name">[]): ReadonlyMap<string, string> =>
  useMemo(() => new Map(manifests.map(({ key, name }) => [key, name])), [manifests]);
