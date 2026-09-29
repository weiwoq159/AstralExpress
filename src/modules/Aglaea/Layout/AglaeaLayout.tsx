import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { Aglaea } from "../module";
import { AglaeaNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(AglaeaNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const AglaeaLayout = () => {
  return <AppLayout module={Aglaea} navigationItems={navigationItems}></AppLayout>;
};
