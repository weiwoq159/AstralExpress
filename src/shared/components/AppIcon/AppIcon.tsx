import type { ComponentProps } from "react";

import type Icon from "@ant-design/icons";

import { ANTD_ICON_MAP, FALLBACK_ICON } from "./registry";

export type AntdIconProps = ComponentProps<typeof Icon>;

export type AppIconProps = AntdIconProps & {
  /** manifest.json 中的 icon 字段，如 "EditOutlined"。 */
  icon?: string | null;
};

/**
 * manifest.icon 字段的唯一渲染出口。
 *
 * 页面 / 模块不得直接 import "@ant-design/icons" 渲染 manifest 来源的图标，
 * 统一通过本组件解析，保证图标名单可控、未命中时有兜底。
 */
export const AppIcon = ({ icon, ...rest }: AppIconProps) => {
  const Comp = icon ? ANTD_ICON_MAP[icon] : undefined;

  if (!Comp) {
    if (import.meta.env.DEV && icon) {
      console.warn(`[AppIcon] 未注册的图标：${icon}，已使用兜底图标`);
    }
    const Fallback = FALLBACK_ICON;
    return <Fallback {...rest} />;
  }

  return <Comp {...rest} />;
};
