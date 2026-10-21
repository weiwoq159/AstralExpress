import type { Navigation } from "@/shared/domain/navigation";

export const AglaeaNavigation: Navigation = {
  home: {
    path: "/aglaea",
    title: "首页",
  },
  incomeStatistics: {
    path: "/aglaea/income-statistics",
    title: "收益统计",
  },
} as const;
