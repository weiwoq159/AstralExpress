import { Link, useParams } from "react-router";

import { Button, Col, Empty, Flex, Result, Row, Spin, Typography } from "antd";

import { ManifestHeader } from "@/catalog/components";
import styles from "@/shared/styles/Page.module.scss";

import { toolsNavigation } from "../navigation";
import { useToolStore } from "../stores/useToolStore";
import layoutStyles from "./Runner.module.scss";
import { LEFT_COL_PROPS } from "./runners/constants/responsiveCol";
import { runnerRegistry } from "./runners";

const { Paragraph, Text } = Typography;

export const Runner = () => {
  const { key } = useParams<{ key: string }>();

  const tools = useToolStore((state) => state.items);
  const loading = useToolStore((state) => state.loading);
  const hasLoaded = useToolStore((state) => state.hasLoaded);
  const error = useToolStore((state) => state.error);
  const tool = tools.find((item) => item.key === key);

  if (!hasLoaded || loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Spin tip="正在加载工具…" />
      </Flex>
    );
  }

  if (error) {
    return <Result status="error" title="工具清单读取失败" subTitle={error} />;
  }

  if (!tool) {
    return <Result status="404" title="未找到该应用" />;
  }

  const detailPath = `${toolsNavigation.library.path}/${tool.key}`;
  const RunnerView = runnerRegistry[tool.key];

  return (
    <div className={`${styles.page} ${layoutStyles.layout}`}>
      <ManifestHeader
        icon={tool.icon}
        name={tool.name}
        description={tool.description}
        status={tool.status}
        backTo={detailPath}
        backLabel="返回详情"
      />

      <Row className={layoutStyles.body}>
        {RunnerView ? (
          <Col {...LEFT_COL_PROPS} className={layoutStyles.column}>
            <RunnerView tool={tool} />
          </Col>
        ) : (
          <Col span={24} className={layoutStyles.column}>
            <Flex vertical align="center" justify="center" gap={14} style={{ height: "100%", padding: "60px 24px" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Flex vertical align="center" gap={6}>
                    <Text strong>运行界面尚未接入</Text>
                    <Paragraph type="secondary" style={{ margin: 0, maxWidth: 360, textAlign: "center" }}>
                      已找到该应用，但对应的运行界面还没有做。
                    </Paragraph>
                  </Flex>
                }
              >
                <Link to={detailPath}>
                  <Button>返回详情</Button>
                </Link>
              </Empty>
            </Flex>
          </Col>
        )}
      </Row>
    </div>
  );
};
