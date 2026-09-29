import { Link } from "react-router";

import type { MenuProps } from "antd";

import { AppLayout } from "@/shared/layout";

import { Cerydra } from "../module";
import { CerydraNavigation } from "../navigation";

const navigationItems: MenuProps["items"] = Object.values(CerydraNavigation).map(({ path, title }) => ({
  key: path,
  label: <Link to={path}>{title}</Link>,
}));

export const CerydraLayout = () => {
  return <AppLayout module={Cerydra} navigationItems={navigationItems}></AppLayout>;
};
