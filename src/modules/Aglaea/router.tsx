import type { AppRouteObject } from "@/router/types";

import { AglaeaLayout } from "./Layout/AglaeaLayout";
import { Aglaea } from "./module";
import { AglaeaNavigation } from "./navigation";
import { Dashboard } from "./pages";

export const AglaeaRouter: AppRouteObject[] = [
  {
    path: AglaeaNavigation.home.path,
    element: <AglaeaLayout />,
    handle: {
      breadcrumb: [{ title: Aglaea.title, to: AglaeaNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: AglaeaNavigation.home.title, to: AglaeaNavigation.home.path }],
          menu: true,
        },
      },
    ],
  },
];
