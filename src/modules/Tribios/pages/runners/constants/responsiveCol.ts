import type { ColProps } from "antd";

/**
 * Runner 页的默认两栏比例：左侧参数/操作面板，右侧预留给以后的预览面板。
 * 现在还没有预览面板，RIGHT_COL_PROPS 暂时没用上，先留着。
 */
export const LEFT_COL_PROPS: ColProps = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 8,
  xxl: 6,
};

export const RIGHT_COL_PROPS: ColProps = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 16,
  xxl: 18,
};
