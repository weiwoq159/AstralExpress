import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocation, Link } from "react-router";

import { Menu, Space, Typography, type MenuProps } from "antd";

import type { ModuleDefinition } from "@/shared/domain/module-definition";
import type { Navigation } from "@/shared/domain/navigation";

import styles from "./AppLayoutMenu.module.scss";

const { Text } = Typography;

type ModuleShellMenuProps = {
  module: ModuleDefinition;
  navigation?: Navigation;
  extra?: ReactNode;
};

export const AppLayoutMenu = ({ module, navigation, extra }: ModuleShellMenuProps) => {
  const { pathname } = useLocation();

  const navigationItems: MenuProps["items"] = useMemo(() => {
    return Object.values(navigation).map(({ path, title }) => ({
      key: path,
      label: <Link to={path}>{title}</Link>,
    }));
  }, [navigation]);

  return (
    <>
      <Space orientation="vertical" size={6} style={{ padding: "26px 24px 18px" }}>
        <Text className={styles.kicker}>{module.name.toUpperCase()}</Text>
        <Text className={styles.title}>功能导航</Text>
      </Space>
      <Menu className={styles.menu} mode="inline" selectedKeys={[pathname]} items={navigationItems} />

      <div className={styles.footer}>
        {extra}
        <Text className={styles.quote} style={{ display: "block" }}>
          {module.description}
        </Text>
      </div>
    </>
  );
};
