import { Layout } from "antd";

import { LayoutHeader } from "@/shared/components";

import { PortalFooter, PortalContent } from "./components";

import styles from "./Portal.module.scss";

const { Content, Header, Footer } = Layout;

export const Portal = () => {
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <LayoutHeader brandName="星穹列车" path="/" />
      </Header>
      <Content>
        <PortalContent />
      </Content>
      <Footer className={styles.footer}>
        <PortalFooter />
      </Footer>
    </Layout>
  );
};
