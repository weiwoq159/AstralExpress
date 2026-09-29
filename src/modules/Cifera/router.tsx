import type { AppRouteObject } from "@/router/types";

import { CiferaLayout } from "./Layout/CiferaLayout";
import { Cifera } from "./module";
import { CiferaNavigation } from "./navigation";
import { Dashboard } from "./pages";

export const CiferaRouter: AppRouteObject[] = [
  {
    path: CiferaNavigation.home.path,
    element: <CiferaLayout />,
    handle: {
      breadcrumb: [{ title: Cifera.title, to: CiferaNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: CiferaNavigation.home.title, to: CiferaNavigation.home.path }],
          menu: true,
        },
      },
    ],
  },
];
