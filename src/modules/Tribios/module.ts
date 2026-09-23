import type { ModuleDefinition } from "@/shared/domain/module-definition";

import ToolsCover from "@/assets/images/cover/Tribios.webp";

export const Tools = {
  name: "tools",
  title: "缇里西庇俄丝",
  path: "/tools",
  purpose: "应用管理与功能入口",
  tags: ["应用管理", "功能入口", "导航"],
  tagline: "「命运的三子」缇里西庇俄丝",
  summary: "自那三相神谕垂怜的圣地，信使分作千身，启程远行。",
  description: "雅努萨波利斯的圣女，缇里西庇俄丝，窃夺「门径」火种的黄金裔，你要为众生奔走，令救世的讯息晓喻大地",
  cover: ToolsCover,
} satisfies ModuleDefinition;
