import { Layout } from "antd";

import { AstralExpressHeader } from "@/shared/components";

import { HubFooter, HubContent } from "@/pages/Hub/components";

import styles from "./Hub.module.scss";

const { Header, Content } = Layout;

export const Hub = () => {
  return (
    <Layout className={styles.layout}>
      <AstralExpressHeader path="/" title="星穹列车" subtitle="ASTRAL EXPRESS" slogan="你的个人工作空间" />
      <Content>
        <HubContent />
      </Content>
      <HubFooter />
    </Layout>
  );
};
