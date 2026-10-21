import type { Navigation } from "@/shared/domain/navigation";

export const CiferaNavigation: Navigation = {
  home: {
    path: "/cifera",
    title: "首页",
  },
  library: {
    path: "/cifera/library",
    title: "爬虫库",
  },
  tasks: {
    path: "/cifera/tasks",
    title: "任务队列",
  },
} as const;
