import type { ModuleDefinition } from "@/shared/domain/module-definition";

import AglaeaCover from "@/assets/images/cover/Aglaea.webp";

export const Aglaea = {
  name: "Aglaea",
  title: "阿格莱雅",
  path: "/Aglaea",
  purpose: "藏宝阁管理与功能入口",
  tags: ["藏宝阁管理", "功能入口", "导航"],
  tagline: "【黄金的织者】阿格莱雅",
  summary: "在那黎明照拂的圣城，织者抚弄金丝，连缀命运。",
  description: "【金织】阿格莱雅，背负【浪漫】火种的黄金裔，你要召集世间英雄，带领他们再度踏上漫长的征程",
  slogan: "【击落众神，归还神火，予以几近覆灭的翁法罗斯新生。】",
  cover: AglaeaCover,
  order: 3,
} satisfies ModuleDefinition;
