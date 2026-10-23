import type { Item } from "@/modules/Aglaea/domain/items/Item";
import type { ItemCategory } from "@/modules/Aglaea/domain/items/ItemCategory";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

/** 对应 Rust 的 aglaea_items_insert 命令参数；Tauri 会把 camelCase 键映射到 snake_case 参数。 */
export interface NewItem {
  name: string;
  /** mhxy-items 目录内的图标文件名，如 "1007.gif"。 */
  icon?: string | null;
  /** 不传时后端按 misc 处理。 */
  category?: ItemCategory;
  description?: string;
  /** 参考价（万两），不传表示暂不计价。 */
  referencePrice?: number | null;
}

export const fetchItems = async (): Promise<Item[]> => {
  if (!isTauri()) {
    return [];
  }
  return invokeApiCommand<Item[]>("aglaea_items_list");
};

export const insertItem = async (item: NewItem): Promise<Item> => {
  // 写入必须真正落库，不能像读取那样在浏览器里返回空值假装成功。
  if (!isTauri()) {
    throw new Error("新增物品仅在桌面端可用");
  }
  return invokeApiCommand<Item>("aglaea_items_insert", { ...item });
};
