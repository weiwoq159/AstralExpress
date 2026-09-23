import { Outlet } from "react-router";

import { Layout, type MenuProps } from "antd";

import { LayoutHeader } from "@/shared/components";
import type { ModuleDefinition } from "@/shared/domain/module-definition";
import { useBreadcrumb } from "@/shared/hooks/useBreadcrumb";
import { ModuleShellMenu } from "@/shared/layout/ModuleShell/components";

import styles from "./ModuleShell.module.scss";

const { Header, Content, Sider } = Layout;

type ModuleShellProps = {
  module: ModuleDefinition;
  navigationItems: MenuProps["items"];
};

export const ModuleShell = ({ module, navigationItems }: ModuleShellProps) => {
  const breadcrumb = useBreadcrumb({ className: styles.breadcrumb });

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <LayoutHeader brandName={module.tagline + " · " + module.purpose} path={module.path} />
      </Header>
      <Layout className={styles.content}>
        <Sider width={204} className={styles.sider} collapsed={false}>
          <ModuleShellMenu module={module} navigationItems={navigationItems} />
        </Sider>
        <Layout className={styles.content}>
          {breadcrumb}
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
