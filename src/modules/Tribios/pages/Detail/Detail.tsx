import { useParams } from "react-router";
import { useNavigate } from "react-router";

import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Flex, Button, Card, Skeleton, Empty, Typography, Row, Col } from "antd";

import { useQuery } from "@tanstack/react-query";

import { readManifest } from "@/shared/api/manifest";
import { Hero, GlassPanel } from "@/shared/components";
import { getManifestCategoryLabel, manifestStatusPresentation } from "@/shared/config/manifest";
import { isTauri } from "@/shared/utils/isTauri";

import { TribiosNavigation } from "@tribios/navigation";

import { OverviewCard, ManifestCard, ExecutionCard } from "./components";

import styles from "./Detail.module.scss";
const { Text } = Typography;

export const Detail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const inTauri = isTauri();

  const {
    data: manifest,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["manifest-detail", "tool", key],
    queryFn: () => readManifest("tool", key as string),
    enabled: Boolean(key) && inTauri,
  });
  const status = manifest ? manifestStatusPresentation[manifest.status] : undefined;

  return (
    manifest && (
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
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching && !isPending}
              onClick={() => refetch()}
              disabled={!key || !inTauri}
            >
              重新加载
            </Button>
            <Button
              type="primary"
              disabled={!manifest || manifest.status !== "available"}
              onClick={() => {
                if (manifest) navigate(`${TribiosNavigation.library.path}/${encodeURIComponent(manifest.key)}/run`);
              }}
            >
              运行应用
            </Button>
          </Flex>
        </Flex>
        <Hero
          eyebrow={manifest.key.toUpperCase()}
          title={manifest.name ?? "应用详情"}
          description={manifest.description ?? "读取应用清单，查看功能信息与任务记录。"}
          tags={manifest.tags ?? []}
          icon={manifest.icon ?? ""}
        />
        {isPending ? (
          <Card className={styles.card}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : error || !manifest ? (
          <GlassPanel>
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
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} lg={16} className={styles.mainColumn}>
              <OverviewCard manifest={manifest} status={status} />
              <ManifestCard manifest={manifest} status={status} />
            </Col>
            <Col xs={24} lg={8} className={styles.sideColumn}>
              <ExecutionCard manifest={manifest} status={status} />
            </Col>
          </Row>
        )}
      </Flex>
    )
  );
};
