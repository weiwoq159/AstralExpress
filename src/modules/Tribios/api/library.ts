import type { Manifest } from "@/shared/domain/manifest";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

const MODULE_ID = "tools";

export const listTools = async (): Promise<Manifest[]> => {
  if (!isTauri()) {
    return Promise.resolve([]);
  }
  return invokeApiCommand<Manifest[]>("get_manifests", { moduleId: MODULE_ID });
};
