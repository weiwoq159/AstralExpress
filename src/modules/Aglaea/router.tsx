import type { AppRouteObject } from "@/router/types";

import { AglaeaLayout } from "./layout/AglaeaLayout";
import { Aglaea } from "./module";
import { AglaeaNavigation } from "./navigation";
import { IncomeStatistics, GuildPrices, Dashboard } from "./pages";

export const AglaeaRouter: AppRouteObject[] = [
  {
    path: AglaeaNavigation.home.path,
    element: <AglaeaLayout />,
    handle: {
      breadcrumb: [{ title: Aglaea.title, to: AglaeaNavigation.home.path }],
    },
    children: [
      {
        path: "",
        element: <Dashboard />,
        handle: {
          breadcrumb: [{ title: AglaeaNavigation.home.title, to: AglaeaNavigation.home.path }],
          menu: true,
        },
      },
      {
        path: "income-statistics",
        element: <IncomeStatistics />,
        handle: {
          breadcrumb: [{ title: AglaeaNavigation.incomeStatistics.title, to: AglaeaNavigation.incomeStatistics.path }],
          menu: true,
        },
      },
      {
        path: "guild-shop",
        element: <GuildPrices />,
        handle: {
          breadcrumb: [{ title: AglaeaNavigation.guildShop.title, to: AglaeaNavigation.guildShop.path }],
          menu: true,
        },
      },
    ],
  },
];
