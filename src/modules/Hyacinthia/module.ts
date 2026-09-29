import type { ModuleDefinition } from "@/shared/domain/module-definition";

import HyacinthiaCover from "@/assets/images/cover/Hyacinthia.webp";

export const Hyacinthia = {
  name: "Hyacinthia",
  title: "雅辛忒丝",
  path: "/Hyacinthia",
  purpose: "网络资源获取",
  tags: ["网络资源获取", "采集方案", "导航"],
  tagline: "【摇光的医师】雅辛忒丝",
  summary: "间城邦随岁月离析，昏光庭院再度敞开门扉，为永夜捎来微光。 ",
  description: "医师雅辛忒丝，守望【天空】火种的黄金裔。你要继承先祖的意志，缝补破裂的晨昏。",
  slogan: "【愿虹光洒落，仇怨消融，黎明重回大地。】",
  cover: HyacinthiaCover,
  order: 6,
} satisfies ModuleDefinition;
