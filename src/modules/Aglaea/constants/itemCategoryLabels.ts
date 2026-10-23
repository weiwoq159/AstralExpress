import type { ItemCategory } from "@/modules/Aglaea/domain/items/ItemCategory";

/** 取值由 Rust 的 ItemCategory 定义并生成类型；这里只维护显示文字，缺任何一项 tsc 都会报错。 */
export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  baoshi: "宝石",
  huanzhuang: "环装",
  wubao: "五宝",
  lianyaoshi: "炼妖石",
  misc: "杂货",
  baotu: "宝图",
  shoujue: "低兽决",
  gaoshoujue: "高兽决",
  lingshijingshi: "灵饰晶石",
  neidan: "内丹",
  gaoneidan: "高内丹",
  teshushoujue: "特殊兽决",
  zhonglingshi: "钟灵石",
  shutie: "书铁",
  fumobaozhu: "附魔宝珠",
  xilian: "召唤兽洗练",
  zhenzhu: "珍珠",
  custom: "自定义",
};

/** 快速记入里的一个分类标签；一个标签可以对应多个后端分类。 */
export interface ItemCategoryGroup {
  key: string;
  label: string;
  categories: readonly ItemCategory[];
}

// 展示上合并的分类：数据库里仍是各自独立的分类，只是标签合成一个。
const MERGED_GROUPS: readonly ItemCategoryGroup[] = [
  { key: "shoujue", label: "兽决", categories: ["shoujue", "gaoshoujue", "teshushoujue"] },
  { key: "neidan", label: "内丹", categories: ["neidan", "gaoneidan"] },
];

/** 按 ITEM_CATEGORY_LABELS 的顺序生成标签；被合并的分类只在第一个成员的位置出现一次。 */
export const ITEM_CATEGORY_GROUPS: readonly ItemCategoryGroup[] = (
  Object.keys(ITEM_CATEGORY_LABELS) as ItemCategory[]
).flatMap((category) => {
  const merged = MERGED_GROUPS.find((group) => group.categories.includes(category));
  if (!merged) {
    return [{ key: category, label: ITEM_CATEGORY_LABELS[category], categories: [category] }];
  }
  return merged.categories[0] === category ? [merged] : [];
});
