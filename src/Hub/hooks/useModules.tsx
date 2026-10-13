import type { ModuleDefinition } from "@/shared/domain/module-definition";

import { registeredModules } from "@/modules/registry";

export const useModules = () => {
  const modules = Array.from(registeredModules.values())
    .map((item) => item.module)
    .sort((a, b) => a.order - b.order);
  const availableModules: ModuleDefinition[] = [];
  const unavailableModules: ModuleDefinition[] = [];
  modules.forEach((module) => {
    if (module.available) {
      availableModules.push(module);
    } else {
      unavailableModules.push(module);
    }
  });
  return { availableModules, unavailableModules, modules };
};
