import type { ModuleDefinition } from "@/shared/domain/module-definition";

import CiferaCover from "@/assets/images/cover/Cifera.webp";

export const Cifera = {
  name: "cifera",
  title: "赛法利娅",
  path: "/cifera",
  purpose: "网络资源获取",
  tags: ["网络资源获取", "采集方案", "导航"],
  tagline: "「捷足的羁客」赛法利娅",
  summary: "失落的盗寇之都多洛斯，三百侠盗纵情游戏，横行无忌。",
  description: "捷足的贼星赛法利娅，戏弄「诡计」火种的黄金裔，奔走吧。愿你的谎言随风同行，吹遍此世大地",
  cover: CiferaCover,
} satisfies ModuleDefinition;
