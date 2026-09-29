import type { ModuleDefinition } from "@/shared/domain/module-definition";

import HelektraCover from "@/assets/images/cover/Helektra.webp";

export const Helektra = {
  name: "Helektra",
  title: "海列屈拉",
  path: "/Helektra",
  purpose: "网络资源获取",
  tags: ["网络资源获取", "采集方案", "导航"],
  tagline: "【奏浪的剑骑】海列屈拉",
  summary: "斯缇科西亚，醉与梦的海滨之城，旧日的歌声仍在浮浪间回荡。",
  description: "大海的女儿海列屈拉，清洗【海洋】火种的黄金裔，你要驱散污浊的暗流，为天外的英雄奏响不醉不归的盛宴。",
  slogan: "【散场之时未到，纵然希望如泡沫般易碎，浪花也将一往无前。】",
  cover: HelektraCover,
  order: 5,
} satisfies ModuleDefinition;
