import type { AppRouteObject } from "@/router/types";

import { CiferaLayout } from "./layout/CiferaLayout";
import { Cifera } from "./module";
import { CiferaNavigation } from "./navigation";
import { Tasks, Library, Dashboard, Detail, Runner, TaskDetail } from "./pages";

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
        path: "library/:key",
        element: <Detail />,
        handle: {
          breadcrumb: [{ title: CiferaNavigation.library.title, to: CiferaNavigation.library.path }],
          menu: true,
        },
      },
      {
        path: "library/:key/run",
        element: <Runner />,
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
      {
        path: "tasks/:uuid",
        element: <TaskDetail />,
        handle: {
          breadcrumb: [{ title: CiferaNavigation.tasks.title, to: CiferaNavigation.tasks.path }],
          menu: true,
        },
      },
    ],
  },
];
