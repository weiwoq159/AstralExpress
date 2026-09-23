import type { AppRouteObject } from "@/router/types";

import { CrawlerDetail } from "./pages/CrawlerDetail";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Runner } from "./pages/Runner";
import { Tasks } from "./pages/Tasks";
import { CiferaLayout } from "./layout";
import { Cifera } from "./module";
import { ciferaNavigation } from "./navigation";

export const CiferaRouter: AppRouteObject[] = [
  {
    path: ciferaNavigation.home.path,
    element: <CiferaLayout />,
    handle: {
      breadcrumb: [{ title: Cifera.title, to: ciferaNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: ciferaNavigation.home.title, to: ciferaNavigation.home.path }],
          menu: true,
        },
      },
      {
        path: "library",
        element: <Library />,
        handle: {
          breadcrumb: [{ title: ciferaNavigation.library.title, to: ciferaNavigation.library.path }],
          menu: true,
        },
      },
      {
        path: "library/:key",
        element: <CrawlerDetail />,
        handle: {
          breadcrumb: [
            { title: ciferaNavigation.library.title, to: ciferaNavigation.library.path },
            { title: "方案详情" },
          ],
        },
      },
      {
        path: "library/:key/run",
        element: <Runner />,
        handle: {
          breadcrumb: [
            { title: ciferaNavigation.library.title, to: ciferaNavigation.library.path },
            { title: "运行" },
          ],
        },
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          breadcrumb: [{ title: ciferaNavigation.tasks.title, to: ciferaNavigation.tasks.path }],
          menu: true,
        },
      },
    ],
  },
];
