import { Layout } from "antd";

import { AstralExpressHeader } from "@/shared/components";

import { HubFooter, HubContent } from "./components";

import styles from "./Hub.module.scss";

const { Header, Content, Footer } = Layout;

export const Hub = () => {
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <AstralExpressHeader brandName="星穹列车" path="/" />
      </Header>
      <Content>
        <HubContent />
      </Content>
      <Footer className={styles.footer}>
        <HubFooter />
      </Footer>
    </Layout>
  );
};
