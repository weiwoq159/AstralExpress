import type { AppRouteObject } from "@/router/types";

import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Runner } from "./pages/Runner";
import { Tasks } from "./pages/Tasks";
import { ToolDetail } from "./pages/ToolDetail";
import { ToolsLayout } from "./layout";
import { Tools } from "./module";
import { toolsNavigation } from "./navigation";

export const ToolsRouter: AppRouteObject[] = [
  {
    path: toolsNavigation.home.path,
    element: <ToolsLayout />,
    handle: {
      breadcrumb: [{ title: Tools.title, to: toolsNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: toolsNavigation.home.title, to: toolsNavigation.home.path }],
          menu: true,
        },
      },
      {
        path: "library",
        element: <Library />,
        handle: {
          breadcrumb: [{ title: toolsNavigation.library.title, to: toolsNavigation.library.path }],
          menu: true,
        },
      },
      {
        path: "library/:key",
        element: <ToolDetail />,
        handle: {
          breadcrumb: [
            { title: toolsNavigation.library.title, to: toolsNavigation.library.path },
            { title: "应用详情" },
          ],
        },
      },
      {
        path: "library/:key/run",
        element: <Runner />,
        handle: {
          breadcrumb: [
            { title: toolsNavigation.library.title, to: toolsNavigation.library.path },
            { title: "运行" },
          ],
        },
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          breadcrumb: [{ title: toolsNavigation.tasks.title, to: toolsNavigation.tasks.path }],
          menu: true,
        },
      },
    ],
  },
];
