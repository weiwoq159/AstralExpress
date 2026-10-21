import type { ModuleDefinition } from "@/shared/domain/module-definition";

import TribiosCover from "@/assets/images/cover/Tribios.webp";

export const Tribios = {
  name: "Tribios",
  title: "缇里西庇俄丝",
  path: "/Tribios",
  purpose: "应用与工具集合",
  tags: ["应用集合", "工具箱", "导航"],
  tagline: "【命运的三子】缇里西庇俄丝",
  summary: "自那三相神谕垂怜的圣地，信使分作千身，启程远行。",
  description: "雅努萨波利斯的圣女，缇里西庇俄丝，窃夺【门径】火种的黄金裔，你要为众生奔走，令救世的讯息晓喻大地",
  cover: TribiosCover,
  slogan: "【找寻那流淌黄金神血的人子，冲破世间至暗，去往星月满天的明日。】",
  order: 1,
  available: true,
} satisfies ModuleDefinition;
