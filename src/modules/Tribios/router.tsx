import type { AppRouteObject } from "@/router/types";

import { TribiosLayout } from "./Layout/TribiosLayout";
import { Tribios } from "./module";
import { TribiosNavigation } from "./navigation";
import { Tasks, Library, Dashboard } from "./pages";

export const TribiosRouter: AppRouteObject[] = [
  {
    path: TribiosNavigation.home.path,
    element: <TribiosLayout />,
    handle: {
      breadcrumb: [{ title: Tribios.title, to: TribiosNavigation.home.path }],
    },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: TribiosNavigation.home.title, to: TribiosNavigation.home.path }],
          menu: true,
        },
      },
      {
        path: "library",
        element: <Library />,
        handle: {
          breadcrumb: [{ title: TribiosNavigation.library.title, to: TribiosNavigation.library.path }],
          menu: true,
        },
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          breadcrumb: [{ title: TribiosNavigation.tasks.title, to: TribiosNavigation.tasks.path }],
          menu: true,
        },
      },
    ],
  },
];
