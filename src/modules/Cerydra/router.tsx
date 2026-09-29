import type { AppRouteObject } from "@/router/types";

import { CerydraLayout } from "./Layout/CerydraLayout";
import { Cerydra } from "./module";
import { CerydraNavigation } from "./navigation";
import { Dashboard } from "./pages";

export const CerydraRouter: AppRouteObject[] = [
  {
    path: CerydraNavigation.home.path,
    element: <CerydraLayout />,
    handle: {
      breadcrumb: [{ title: Cerydra.title, to: CerydraNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: CerydraNavigation.home.title, to: CerydraNavigation.home.path }],
          menu: true,
        },
      },
    ],
  },
];
