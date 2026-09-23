/**
 * 从完整 URL 中提取主机名，用于展示或按站点分组/筛选。
 * URL 不合法时原样返回输入，不抛出。
 */
export const getUrlHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
