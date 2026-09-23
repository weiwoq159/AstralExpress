import type { ComponentType } from "react";

import type { Manifest } from "@/shared/domain/manifest";

import { MhxyCbgPetsRunner } from "./MhxyCbgPets/MhxyCbgPetsRunner";
import { MhxyCbgSchoolsRunner } from "./MhxyCbgSchools/MhxyCbgSchoolsRunner";
import { MhxyCbgServicesRunner } from "./MhxyCbgServices/MhxyCbgServicesRunner";

export type RunnerComponent = ComponentType<{ tool: Manifest }>;

/** manifest key -> 对应的运行界面。查不到时上层渲染兜底态，不是每个方案都要求接入。 */
export const runnerRegistry: Record<string, RunnerComponent> = {
  "mhxy-cbg-pets": MhxyCbgPetsRunner,
  "mhxy-cbg-schools": MhxyCbgSchoolsRunner,
  "mhxy-cbg-services": MhxyCbgServicesRunner,
};
