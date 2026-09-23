/**
 * manifest.category 是自由字符串（后端没有枚举约束，参见 src-tauri/src/domain/manifest.rs），
 * 这里只是已知取值的展示文案映射，不是穷举的合法值列表。
 * 没在表里的分类原样展示，不报错、不隐藏。
 */
const manifestCategoryLabel: Record<string, string> = {
  document: "文档工具",
  file: "文件处理",
  media: "媒体处理",
  network: "网络工具",
  system: "系统管理",
  utility: "实用采集",
  download: "图片下载",
  json: "JSON 数据采集",
};

export const getManifestCategoryLabel = (category: string): string => manifestCategoryLabel[category] ?? category;
