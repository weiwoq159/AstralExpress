import { useNavigate, useParams } from "react-router";

import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Flex, Row, Skeleton, Typography } from "antd";

import { GlassPanel, Hero } from "@/shared/components";
import { manifestStatusPresentation } from "@/shared/config/manifest";
import type { Manifest } from "@/shared/domain/manifest";
import { useManifest } from "@/shared/hooks/useManifest";

import { TribiosNavigation } from "@tribios/navigation";

import { ExecutionCard, ManifestCard, OverviewCard } from "./components";

import styles from "./Detail.module.scss";

const { Text } = Typography;

export const Detail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const { data: manifest, isPending, isFetching, error, refetch } = useManifest("tool", key as string);

  return (
    <Flex vertical gap={18}>
      <Flex justify="space-between">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className={styles.back}
          onClick={() => navigate(TribiosNavigation.library.path)}
        >
          返回应用库
        </Button>
        <Flex gap={8}>
          <Button icon={<ReloadOutlined />} loading={isFetching && !isPending} onClick={() => refetch()}>
            重新加载
          </Button>
          <Button
            type="primary"
            disabled={manifest?.status !== "available"}
            onClick={() => {
              if (manifest) navigate(`${TribiosNavigation.library.path}/${encodeURIComponent(manifest.key)}/run`);
            }}
          >
            运行应用
          </Button>
        </Flex>
      </Flex>

      <Hero
        eyebrow={manifest?.key.toUpperCase()}
        title={manifest?.name ?? "应用详情"}
        description={manifest?.description ?? "读取应用清单，查看功能信息与任务记录。"}
        tags={manifest?.tags ?? []}
        icon={manifest?.icon ?? ""}
      />

      {isPending ? (
        <GlassPanel hoverable={false}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </GlassPanel>
      ) : error || !manifest ? (
        <GlassPanel hoverable={false}>
          <Empty description="未能读取应用详情">
            <Text type="secondary">{error instanceof Error ? error.message : "请确认应用仍存在，然后重试。"}</Text>
            <div className={styles.retry}>
              <Button type="primary" onClick={() => refetch()}>
                重试
              </Button>
            </div>
          </Empty>
        </GlassPanel>
      ) : (
        <DetailContent manifest={manifest} />
      )}
    </Flex>
  );
};

/** 成功态内容：manifest 一定存在，status 在此推导，子卡片 props 均为必填。 */
const DetailContent = ({ manifest }: { manifest: Manifest }) => {
  const status = manifestStatusPresentation[manifest.status];

  return (
    <Row gutter={[24, 24]} align="stretch">
      <Col xs={24} lg={16} className={styles.mainColumn}>
        <OverviewCard manifest={manifest} status={status} />
        <ManifestCard manifest={manifest} status={status} />
      </Col>
      <Col xs={24} lg={8} className={styles.sideColumn}>
        <ExecutionCard manifest={manifest} status={status} />
      </Col>
    </Row>
  );
};
