import type { AppRouteObject } from "@/router/types";

import { HelektraLayout } from "./Layout/HelektraLayout";
import { Helektra } from "./module";
import { HelektraNavigation } from "./navigation";
import { Dashboard } from "./pages";

export const HelektraRouter: AppRouteObject[] = [
  {
    path: HelektraNavigation.home.path,
    element: <HelektraLayout />,
    handle: {
      breadcrumb: [{ title: Helektra.title, to: HelektraNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: HelektraNavigation.home.title, to: HelektraNavigation.home.path }],
          menu: true,
        },
      },
    ],
  },
];
