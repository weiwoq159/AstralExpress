import type { ShopWithShelves } from "./shop";

// 暂用原型里的演示数据，等 Rust 端提供货架读取命令后改为由 hook 提供，并删除本文件。
const CATALOG = [
  "强化石",
  "金创药",
  "魔法药水",
  "铁矿石",
  "银矿石",
  "宝石碎片",
  "传送卷轴",
  "宠物口粮",
  "精炼符",
  "幸运符",
  "秘银",
  "修复锤",
  "加速药水",
  "经验卷轴",
  "护身符",
  "魔法水晶",
];

export const DEMO_SHOPS: ShopWithShelves[] = Array.from({ length: 12 }, (_, shopIndex) => ({
  id: shopIndex + 1,
  areaId: 1,
  serverId: 1,
  number: shopIndex + 1,
  name: `店铺 ${String(shopIndex + 1).padStart(2, "0")}`,
  // 让一部分店铺带折扣，演示"比价按折后价"。
  discountPercent: shopIndex % 5 === 2 ? 10 : 0,
  createdAt: 0,
  updatedAt: 0,
  shelves: Array.from({ length: 10 }, (_, shelfIndex) => {
    const main = CATALOG[(shopIndex * 3 + shelfIndex * 5) % CATALOG.length];
    const itemNames =
      shelfIndex % 3 === 1 ? [main, CATALOG[(shopIndex * 7 + shelfIndex * 3 + 4) % CATALOG.length]] : [main];
    if (shopIndex < 10 && shelfIndex === shopIndex % 5) itemNames[0] = "强化石";
    return {
      position: shelfIndex + 1,
      itemNames: [...new Set(itemNames)],
      price: 80 + ((shopIndex * 173 + shelfIndex * 79) % 19) * 90 + (shelfIndex % 3) * 15,
    };
  }),
}));
