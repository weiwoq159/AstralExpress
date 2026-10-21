import type { ReactNode } from "react";
import { Outlet } from "react-router";

import { Layout } from "antd";

import { AstralExpressHeader } from "@/shared/components";
import type { ModuleDefinition } from "@/shared/domain/module-definition";
import type { Navigation } from "@/shared/domain/navigation";
import { useBreadcrumb } from "@/shared/hooks/useBreadcrumb";

import { AppLayoutMenu } from "./components";

import styles from "./AppLayout.module.scss";

const { Content, Sider } = Layout;

type AppLayoutProps = {
  children?: ReactNode;
  module: ModuleDefinition;
  navigation?: Navigation;
  isPadding?: boolean;
};

export const AppLayout = ({ children, module, navigation, isPadding = true }: AppLayoutProps) => {
  const breadcrumb = useBreadcrumb({ className: styles.breadcrumb });

  return (
    <Layout>
      <AstralExpressHeader path={module.path} title={module.purpose} subtitle={module.name} slogan={module.title} />
      <Layout>
        <Sider width={204} className={styles.sider} collapsed={false}>
          <AppLayoutMenu module={module} navigation={navigation} />
        </Sider>
        <Layout>
          {breadcrumb}
          <Content className={isPadding ? styles.content : ""}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
