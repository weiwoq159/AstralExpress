// 构建时扫描图标目录；路径必须是字面量，Vite 要在编译期静态分析它。
const modules = import.meta.glob("@/assets/images/mhxy-items/*.{gif,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** 图标文件名（如 "1007.gif"，也是数据库 items.icon 里存的值）→ 打包后的 URL。构建后 URL 带哈希，所以库里不存 URL。 */
export const ITEM_ICONS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split("/").pop() as string, url]),
);
