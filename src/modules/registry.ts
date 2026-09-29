import type { ModuleDefinition } from "@/shared/domain/module-definition";

import type { AppRouteObject } from "@/router/types";

import { Aglaea } from "./Aglaea/module";
import { AglaeaRouter } from "./Aglaea/router";
import { Cerydra } from "./Cerydra/module";
import { CerydraRouter } from "./Cerydra/router";
import { Cifera } from "./Cifera/module";
import { CiferaRouter } from "./Cifera/router";
import { Helektra } from "./Helektra/module";
import { HelektraRouter } from "./Helektra/router";
import { Hyacinthia } from "./Hyacinthia/module";
import { HyacinthiaRouter } from "./Hyacinthia/router";
import { Tribios } from "./Tribios/module";
import { TribiosRouter } from "./Tribios/router";

type ModuleRegistration = {
  module: ModuleDefinition;
  routes: readonly AppRouteObject[];
};

export const registeredModules = new Map<string, ModuleRegistration>([
  [Tribios.name, { module: Tribios, routes: TribiosRouter }],
  [Aglaea.name, { module: Aglaea, routes: AglaeaRouter }],
  [Cerydra.name, { module: Cerydra, routes: CerydraRouter }],
  [Cifera.name, { module: Cifera, routes: CiferaRouter }],
  [Helektra.name, { module: Helektra, routes: HelektraRouter }],
  [Hyacinthia.name, { module: Hyacinthia, routes: HyacinthiaRouter }],
]);

export const moduleRoutes = [...registeredModules.values()].flatMap(({ routes }) => routes);
