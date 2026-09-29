import { moduleRoutes } from "@/modules/registry";

import { Hub } from "../Hub/Hub";
import type { AppRouteObject } from "./types";

export const routes: AppRouteObject[] = [
  {
    path: "/",
    element: <Hub />,
    handle: {
      breadcrumb: [{ title: "翁法罗斯" }],
    },
  },
  ...moduleRoutes,
];
