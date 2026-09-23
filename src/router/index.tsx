import { Portal } from "@/portal/Portal";
import { moduleRoutes } from "@/modules/registry";

import type { AppRouteObject } from "./types";

export const routes: AppRouteObject[] = [
  {
    path: "/",
    element: <Portal />,
    handle: {
      breadcrumb: [{ title: "翁法罗斯" }],
    },
  },
  ...moduleRoutes,
];
