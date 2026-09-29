import { Outlet } from "react-router";

import { Layout, type MenuProps } from "antd";

import { AstralExpressHeader } from "@/shared/components";
import type { ModuleDefinition } from "@/shared/domain/module-definition";
import { useBreadcrumb } from "@/shared/hooks";

import { AppLayoutMenu } from "./components";

import styles from "./AppLayout.module.scss";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  module: ModuleDefinition;
  navigationItems: MenuProps["items"];
}

export const AppLayout = ({ module, navigationItems }: AppLayoutProps) => {
  const breadcrumb = useBreadcrumb({ className: styles.breadcrumb });

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <AstralExpressHeader brandName={module.tagline + " · " + module.purpose} path={module.path} />
      </Header>
      <Layout className={styles.content}>
        <Sider width={204} className={styles.sider} collapsed={false}>
          <AppLayoutMenu module={module} navigationItems={navigationItems} />
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
