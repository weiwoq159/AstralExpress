import type { AppRouteObject } from "@/router/types";

import { CiferaLayout } from "./Layout/CiferaLayout";
import { Cifera } from "./module";
import { CiferaNavigation } from "./navigation";
import { Dashboard, Library, Tasks } from "./pages";

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
      {
        path: "library",
        element: <Library />,
        handle: {
          breadcrumb: [{ title: CiferaNavigation.library.title, to: CiferaNavigation.library.path }],
          menu: true,
        },
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          breadcrumb: [{ title: CiferaNavigation.tasks.title, to: CiferaNavigation.tasks.path }],
          menu: true,
        },
      },
    ],
  },
];
