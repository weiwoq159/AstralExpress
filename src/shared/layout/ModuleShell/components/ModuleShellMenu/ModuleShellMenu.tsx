import type { ReactNode } from "react";
import { useLocation } from "react-router";

import { Menu, Space, Typography, type MenuProps } from "antd";

import type { ModuleDefinition } from "@/shared/domain/module-definition";

import styles from "./ModuleShellMenu.module.scss";

const { Text } = Typography;

type ModuleShellMenuProps = {
  module: ModuleDefinition;
  navigationItems: MenuProps["items"];
  extra?: ReactNode;
};

export const ModuleShellMenu = ({ module, navigationItems, extra }: ModuleShellMenuProps) => {
  const { pathname } = useLocation();

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
