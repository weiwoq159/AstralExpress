import type { AppRouteObject } from "@/router/types";

import { HyacinthiaLayout } from "./Layout/HyacinthiaLayout";
import { Hyacinthia } from "./module";
import { HyacinthiaNavigation } from "./navigation";
import { Dashboard } from "./pages";

export const HyacinthiaRouter: AppRouteObject[] = [
  {
    path: HyacinthiaNavigation.home.path,
    element: <HyacinthiaLayout />,
    handle: {
      breadcrumb: [{ title: Hyacinthia.title, to: HyacinthiaNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: HyacinthiaNavigation.home.title, to: HyacinthiaNavigation.home.path }],
          menu: true,
        },
      },
    ],
  },
];
