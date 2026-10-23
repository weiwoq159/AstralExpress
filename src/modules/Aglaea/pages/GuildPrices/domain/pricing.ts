import type { Shelf, ShopWithShelves } from "./shop";

export type SortOrder = "asc" | "desc";

/** 每家店固定的货架数。 */
export const SHELVES_PER_SHOP = 10;

/** 折后价 = 货架价 × (100 - 折扣) / 100。比价一律用折后价，否则不同折扣的店铺不可比。 */
export const discountedPrice = (price: number, discountPercent: number) => (price * (100 - discountPercent)) / 100;

export const formatPrice = (price: number) => price.toLocaleString("zh-CN", { maximumFractionDigits: 2 });

const sellingShelves = (shop: ShopWithShelves, itemName: string) =>
  shop.shelves.filter((shelf) => shelf.itemNames.includes(itemName));

/** 店内该道具的最低折后价；店里没有这个道具时为 null。 */
export const lowestPrice = (shop: ShopWithShelves, itemName: string): number | null => {
  const prices = sellingShelves(shop, itemName).map((shelf) => discountedPrice(shelf.price, shop.discountPercent));
  return prices.length > 0 ? Math.min(...prices) : null;
};

/** 全部店铺里出现过的道具名，按中文排序。 */
export const listItemNames = (shops: readonly ShopWithShelves[]): string[] =>
  [...new Set(shops.flatMap((shop) => shop.shelves.flatMap((shelf) => shelf.itemNames)))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );

/** 把店铺的货架补齐成 SHELVES_PER_SHOP 个位置，没摆东西的位置为 null。 */
export const toShelfSlots = (shop: ShopWithShelves): (Shelf | null)[] =>
  Array.from(
    { length: SHELVES_PER_SHOP },
    (_, index) => shop.shelves.find((shelf) => shelf.position === index + 1) ?? null,
  );

export interface RankedShop {
  shop: ShopWithShelves;
  /** 选了道具时为店内最低折后价；没选道具时为 null。 */
  price: number | null;
  /** 选了道具时为在售该道具的货架数；没选时为已摆货的货架数。 */
  shelfCount: number;
}

export interface RankOptions {
  /** 空字符串表示不按道具比价，全部店铺按编号排列。 */
  itemName: string;
  order: SortOrder;
  /** 按店铺名称或编号筛选。 */
  keyword: string;
}

export const rankShops = (
  shops: readonly ShopWithShelves[],
  { itemName, order, keyword }: RankOptions,
): RankedShop[] => {
  const text = keyword.trim().toLowerCase();
  const sign = order === "desc" ? -1 : 1;

  return shops
    .map((shop) => ({
      shop,
      price: itemName ? lowestPrice(shop, itemName) : null,
      shelfCount: itemName ? sellingShelves(shop, itemName).length : shop.shelves.length,
    }))
    .filter(
      ({ shop, price }) =>
        (!itemName || price !== null) &&
        (!text || shop.name.toLowerCase().includes(text) || String(shop.number).includes(text)),
    )
    .sort((a, b) => {
      const byNumber = a.shop.number - b.shop.number;
      if (a.price === null || b.price === null) return byNumber;
      return (a.price - b.price) * sign || byNumber;
    });
};

export interface PricePoint {
  shopName: string;
  price: number;
}

export interface PriceSummary {
  shopCount: number;
  /** 在售所选道具的店铺数；没选道具时为 null。 */
  sellingCount: number | null;
  lowest: PricePoint | null;
  highest: PricePoint | null;
}

/** 统计全部店铺（不受名称筛选影响）里所选道具的价格分布。 */
export const summarizePrices = (shops: readonly ShopWithShelves[], itemName: string): PriceSummary => {
  const points: PricePoint[] = [];
  if (itemName) {
    for (const shop of shops) {
      const price = lowestPrice(shop, itemName);
      if (price !== null) points.push({ shopName: shop.name, price });
    }
  }

  const pick = (better: (a: number, b: number) => boolean) =>
    points.reduce<PricePoint | null>(
      (best, point) => (best === null || better(point.price, best.price) ? point : best),
      null,
    );

  return {
    shopCount: shops.length,
    sellingCount: itemName ? points.length : null,
    lowest: pick((a, b) => a < b),
    highest: pick((a, b) => a > b),
  };
};
