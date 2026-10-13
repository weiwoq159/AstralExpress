import type { Manifest } from "@/shared/domain/manifest";
import type { ModuleId } from "@/shared/domain/module";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

export const listManifests = async (moduleId: ModuleId): Promise<Manifest[]> => {
  if (!isTauri()) return [];
  return invokeApiCommand<Manifest[]>("list_manifests", { moduleId });
};

export const readManifest = async (moduleId: ModuleId, manifestKey: string): Promise<Manifest | null> => {
  if (!isTauri()) return Promise.resolve(null);
  return invokeApiCommand<Manifest | null>("read_manifest", { moduleId, manifestKey });
};
