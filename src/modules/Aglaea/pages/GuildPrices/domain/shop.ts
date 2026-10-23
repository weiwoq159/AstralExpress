import type { GuildShop } from "@/modules/Aglaea/domain/guild_shop/GuildShop";

/** 货架。表里只存摆了道具的货架，空货架不存在。 */
export interface Shelf {
  /** 货架位置，1～10。 */
  position: number;
  /** 货架上所有道具共用的标价，单位：两。折扣在店铺上，不在这里。 */
  price: number;
  /** 货架上的道具名，1～2 个。 */
  itemNames: string[];
}

// Rust 端还没有读取货架的命令；有了之后，这个类型改为由 ts-rs 从 Rust 导出，不再手写。
export interface ShopWithShelves extends GuildShop {
  shelves: Shelf[];
}
