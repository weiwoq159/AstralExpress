import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { listManifests, readManifest } from "@/shared/api/manifest";
import type { ModuleId } from "@/shared/domain/module";
/** 根据当前模块的清单生成 key 索引，避免另行维护静态 key/manifest 对照表。 */
const EMPTY_MANIFESTS: Awaited<ReturnType<typeof listManifests>> = [];

/** 根据当前模块的清单生成 key 索引。 */
export const useManifests = (moduleId: ModuleId, limit?: number) => {
  const { data } = useQuery({
    queryKey: ["manifests", moduleId],
    queryFn: () => listManifests(moduleId),
  });
  const QuickAccessManifests = limit === undefined || !data ? EMPTY_MANIFESTS : data.slice(0, limit);
  return {
    manifests: data ?? EMPTY_MANIFESTS,
    QuickAccessManifests,
  };
};

export const useManifestMap = (moduleId: ModuleId) => {
  const { manifests } = useManifests(moduleId);
  const manifestMap = useMemo(() => new Map(manifests.map((manifest) => [manifest.key, manifest])), [manifests]);
  return { manifests, manifestMap };
};

export const useManifest = (moduleId: ModuleId, manifestKey: string) => {
  const { data } = useQuery({
    queryKey: ["manifest", moduleId, manifestKey],
    queryFn: () => readManifest(moduleId, manifestKey),
  });
  return { data };
};
