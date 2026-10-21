import type { ComponentProps } from "react";

import type Icon from "@ant-design/icons";
import { createFromIconfontCN } from "@ant-design/icons";

import { ANTD_ICON_MAP, FALLBACK_ICON, ICONFONT_PREFIX } from "./registry";

export type AntdIconProps = ComponentProps<typeof Icon>;

export type AppIconProps = AntdIconProps & {
  /** manifest.json 中的 icon 字段，如 "EditOutlined"（Ant Design）或 "icon-xxx"（iconfont）。 */
  icon?: string | null;
};

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/c/font_5240797_dx7w8qndz8n.js",
});

/**
 * manifest.icon 字段的唯一渲染出口。
 *
 * 页面 / 模块不得直接 import "@ant-design/icons" 渲染 manifest 来源的图标，统一通过本组件解析：
 * 1. 先查 ANTD_ICON_MAP（Ant Design Outlined 图标）；
 * 2. 未命中且以 `icon-` 开头时，交给 IconFont（阿里图标库）渲染；
 * 3. 仍未命中则使用 FALLBACK_ICON，并在 DEV 下 console.warn。
 */
export const AppIcon = ({ icon, ...rest }: AppIconProps) => {
  const Comp = icon ? ANTD_ICON_MAP[icon] : undefined;
  if (Comp) {
    return <Comp {...rest} />;
  }

  if (icon?.startsWith(ICONFONT_PREFIX)) {
    return <IconFont type={icon} {...rest} />;
  }

  if (import.meta.env.DEV && icon) {
    console.warn(`[AppIcon] 未注册的图标：${icon}，已使用兜底图标`);
  }

  const Fallback = FALLBACK_ICON;
  return <Fallback {...rest} />;
};
