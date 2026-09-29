import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { Hyacinthia } from "../module";
import { HyacinthiaNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(HyacinthiaNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const HyacinthiaLayout = () => {
  return <AppLayout module={Hyacinthia} navigationItems={navigationItems}></AppLayout>;
};
