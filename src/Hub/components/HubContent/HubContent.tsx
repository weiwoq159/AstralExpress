import { useNavigate } from "react-router";

import { Card, Row, Col, Image, Typography } from "antd";

import { registeredModules } from "@/modules/registry";

import styles from "./HubContent.module.scss";

const { Text } = Typography;

const moduleList = [...registeredModules.values()].map(({ module }) => module);

export const HubContent = () => {
  const navigate = useNavigate();
  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto", padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {moduleList.map((module) => (
          <Col key={module.name} xs={12} sm={12} md={8} lg={8} xl={8} xxl={6} xxxl={4}>
            <Card
              hoverable
              className={styles.card}
              onClick={() => navigate(module.path)}
              cover={
                <div className={styles.coverContainer}>
                  <Image
                    alt={`${module.title}封面`}
                    preview={false}
                    src={module.cover}
                    style={{ transition: "transform 240ms ease" }}
                  />
                </div>
              }
            >
              <h2 className={styles.cardTitle}>{module.title}</h2>
              <Text className={styles.cardTagline}>{module.tagline}</Text>
              <Text className={styles.cardPurpose}>{module.purpose}</Text>
              <Text className={styles.cardDescription}>{module.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
