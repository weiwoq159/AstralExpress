import type { ModuleDefinition } from "@/shared/domain/module-definition";

import type { AppRouteObject } from "@/router/types";

import { Cifera } from "./Cifera/module";
import { CiferaRouter } from "./Cifera/router";
import { Tools } from "./Tribios/module";
import { ToolsRouter } from "./Tribios/router";

type ModuleRegistration = {
  module: ModuleDefinition;
  routes: readonly AppRouteObject[];
};

export const registeredModules = new Map<string, ModuleRegistration>([
  [Tools.name, { module: Tools, routes: ToolsRouter }],
  [Cifera.name, { module: Cifera, routes: CiferaRouter }],
]);

export const moduleRoutes = [...registeredModules.values()].flatMap(({ routes }) => routes);
