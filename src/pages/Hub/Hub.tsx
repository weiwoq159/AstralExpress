import { Layout } from "antd";

import { AstralExpressHeader } from "@/shared/components";

import { HubFooter, HubContent } from "./components";
import { useModules } from "./hooks/useModules";

import styles from "./Hub.module.scss";

const { Content } = Layout;

export const Hub = () => {
  const { modules, availableModules, unavailableModules } = useModules();

  return (
    <Layout className={styles.layout}>
      <AstralExpressHeader path="/" title="星穹列车" subtitle="ASTRAL EXPRESS" slogan="你的个人工作空间" />
      <Content>
        <HubContent modules={modules} />
      </Content>
      <HubFooter openedCount={availableModules.length} plannedCount={unavailableModules.length} />
    </Layout>
  );
};
