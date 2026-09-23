import type { ColProps } from "antd";

/**
 * Runner 页目前只有无参数的方案接入，没有需要展示的表单，所以左栏直接占满整行，
 * 跟 Hero 一样铺满宽度。等有方案需要"左侧参数 + 右侧预览"的两栏布局时再拆窄。
 */
export const LEFT_COL_PROPS: ColProps = {
  span: 24,
};
