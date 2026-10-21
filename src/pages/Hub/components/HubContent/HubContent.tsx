import { useNavigate } from "react-router";

import { Row, Col, Card, Image, Tag, Flex, Typography, Space } from "antd";

import type { ModuleDefinition } from "@/shared/domain/module-definition";

import styles from "./HubContent.module.scss";

const { Text, Paragraph } = Typography;

interface HubContentProps {
  modules: readonly ModuleDefinition[];
}

export const HubContent = ({ modules }: HubContentProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.content}>
      <Row gutter={[24, 24]}>
        {modules.map((module) => (
          <Col span={4} key={module.name}>
            <Card
              hoverable={module.available}
              className={module.available ? styles.root : `${styles.root} ${styles.soon}`}
              onClick={() => module.available && navigate(module.path)}
              cover={
                <div className={styles.cover}>
                  <Image alt={`${module.title}封面`} preview={false} src={module.cover} />
                  <Text className={styles.order}>{String(module.order).padStart(2, "0")}</Text>
                  <Tag className={styles.badge} color={module.available ? "success" : "default"}>
                    {module.available ? "已开放" : "筹备中"}
                  </Tag>
                  <Flex vertical className={styles.over}>
                    <b>{module.title}</b>
                    <span>{module.tagline}</span>
                  </Flex>
                </div>
              }
            >
              <Flex vertical gap={10}>
                <Text strong className={styles.purpose}>
                  {module.purpose}
                </Text>
                <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ marginBottom: 0 }}>
                  {module.description}
                </Paragraph>
                <Space size={6} wrap>
                  {module.tags.map((tag) => (
                    <Tag key={tag} color="blue" variant="filled" style={{ marginInlineEnd: 0 }}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
