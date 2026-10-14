import { Hub } from "@/pages/Hub/Hub";
import { Settings } from "@/pages/Settings/Settings";

import { moduleRoutes } from "@/modules/registry";

export const routes = [
  {
    path: "/",
    element: <Hub />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  ...moduleRoutes,
];
