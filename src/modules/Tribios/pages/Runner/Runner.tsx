import { useNavigate, useParams } from "react-router";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Empty, Flex, Skeleton, Typography } from "antd";

import { GlassPanel, Hero } from "@/shared/components";
import { useManifest } from "@/shared/hooks/useManifest";

import { Tribios } from "@tribios/module";
import { TribiosNavigation } from "@tribios/navigation";

import { RUNNER_PAGES } from "./registry";

import styles from "./Runner.module.scss";

const { Text } = Typography;

export const Runner = () => {
  const { key = "" } = useParams();
  const navigate = useNavigate();
  const { data: manifest, isPending, error } = useManifest("tool", key);
  const AppRunner = manifest ? RUNNER_PAGES[manifest.key] : undefined;

  return (
    <Flex vertical gap={20} className={styles.runner}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className={styles.back}
        onClick={() => navigate(TribiosNavigation.library.path)}
      >
        返回应用库
      </Button>
      <Hero
        className={styles.hero}
        eyebrow={`RUN APPLICATION / ${manifest?.category === "Files" ? "文件整理" : "应用运行"}`}
        title={manifest?.name ?? "运行应用"}
        description={manifest?.description ?? "配置应用参数并查看运行信息。"}
        tags={manifest ? [manifest.isQueue ? "队列应用" : "即时运行", ...manifest.tags] : []}
        cover={Tribios.cover}
      />
      {isPending ? (
        <GlassPanel hoverable={false}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </GlassPanel>
      ) : error || !manifest ? (
        <GlassPanel hoverable={false}>
          <Empty description="未能读取应用清单">
            <Text type="secondary">请确认应用仍存在，然后重试。</Text>
          </Empty>
        </GlassPanel>
      ) : !AppRunner ? (
        <GlassPanel hoverable={false}>
          <Empty description={`“${manifest.name}”尚未配置 Runner 页面`} />
        </GlassPanel>
      ) : (
        <AppRunner key={manifest.key} manifest={manifest} />
      )}
    </Flex>
  );
};
