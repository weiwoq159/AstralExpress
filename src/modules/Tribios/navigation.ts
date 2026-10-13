import type { Navigation } from "@/shared/domain/navigation";
export const TribiosNavigation: Navigation = {
  home: {
    path: "/Tribios",
    title: "首页",
  },
  library: {
    path: "/Tribios/library",
    title: "应用库",
  },
  tasks: {
    path: "/Tribios/tasks",
    title: "任务队列",
  },
} as const;
