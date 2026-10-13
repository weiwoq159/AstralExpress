import { useNavigate } from "react-router";

import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Flex, Row, Skeleton, Typography } from "antd";

import { GlassPanel } from "@/shared/components/GlassPanel/GlassPanel";
import { Hero } from "@/shared/components/Hero/Hero";
import { manifestStatusPresentation } from "@/shared/config/manifest";
import type { Manifest } from "@/shared/domain/manifest";
import type { ModuleId } from "@/shared/domain/module";
import { useManifest } from "@/shared/hooks/useManifest";

import { ExecutionCard, ManifestCard, OverviewCard } from "./components";

import styles from "./ManifestDetail.module.scss";

const { Text } = Typography;

export interface ManifestDetailProps {
  /** 清单所属模块（tool / crawler），决定读取哪个目录下的清单。 */
  moduleId: ModuleId;
  manifestKey: string;
  /** “返回应用库”跳转的路径。 */
  backPath: string;
  /** 根据应用 key 生成“运行应用”跳转的路径。 */
  getRunPath: (manifestKey: string) => string;
}

/** 应用详情页（工具栏 + Hero + 加载/失败/成功三态），各模块共用，仅需传入模块与路由。 */
export const ManifestDetail = ({ moduleId, manifestKey, backPath, getRunPath }: ManifestDetailProps) => {
  const navigate = useNavigate();
  const { data: manifest, isPending, isFetching, error, refetch } = useManifest(moduleId, manifestKey);

  return (
    <Flex vertical gap={18}>
      <Flex justify="space-between">
        <Button type="text" icon={<ArrowLeftOutlined />} className={styles.back} onClick={() => navigate(backPath)}>
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
              if (manifest) navigate(getRunPath(manifest.key));
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
        <ManifestDetailContent manifest={manifest} />
      )}
    </Flex>
  );
};

/** 成功态内容：manifest 一定存在，status 在此推导，子卡片 props 均为必填。 */
const ManifestDetailContent = ({ manifest }: { manifest: Manifest }) => {
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
