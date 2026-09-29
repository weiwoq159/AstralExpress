import type { ModuleDefinition } from "@/shared/domain/module-definition";

import CerydraCover from "@/assets/images/cover/Cerydra.webp";

export const Cerydra = {
  name: "Cerydra",
  title: "刻律德菈",
  path: "/Cerydra",
  purpose: "藏宝阁管理与功能入口",
  tags: ["藏宝阁管理", "功能入口", "导航"],
  tagline: "【执棋的君主】刻律德菈",
  summary: "北境帝国，失落的王朝，寒冷的疆土燃烧着征伐的野心。",
  description: "君主刻律德菈，执握【律法】火种的黄金裔，你要布局设子，与神相弈，审判异心的罪囚，为此世奠定逐火的基业",
  slogan: "【这绝非终点，翁法罗斯的征途，当是银河群星！】",
  cover: CerydraCover,
  order: 4,
} satisfies ModuleDefinition;
