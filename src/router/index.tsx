import { Hub } from "@/Hub/Hub";

import { moduleRoutes } from "@/modules/registry";

export const routes = [
  {
    path: "/",
    element: <Hub />,
  },
  ...moduleRoutes,
];
