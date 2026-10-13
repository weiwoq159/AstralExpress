import type { ModuleDefinition } from "@/shared/domain/module-definition";

import type { AppRouteObject } from "@/router/types";

import { Cifera } from "./Cifera/module";
import { CiferaRouter } from "./Cifera/router";
import { Tribios } from "./Tribios/module";
import { TribiosRouter } from "./Tribios/router";

type ModuleRegistration = {
  module: ModuleDefinition;
  routes: readonly AppRouteObject[];
};

export const registeredModules = new Map<string, ModuleRegistration>([
  [Tribios.name, { module: Tribios, routes: TribiosRouter }],
  [Cifera.name, { module: Cifera, routes: CiferaRouter }],
]);

export const moduleRoutes = [...registeredModules.values()].flatMap(({ routes }) => routes);
