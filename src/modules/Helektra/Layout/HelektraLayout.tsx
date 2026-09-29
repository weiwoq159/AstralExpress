import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { Helektra } from "../module";
import { HelektraNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(HelektraNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const HelektraLayout = () => {
  return <AppLayout module={Helektra} navigationItems={navigationItems}></AppLayout>;
};
