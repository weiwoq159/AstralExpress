import { useNavigate } from "react-router";

import { Card, Row, Col, Image, Typography } from "antd";

import { registeredModules } from "@/modules/registry";

import styles from "./PortalContent.module.scss";

const { Text } = Typography;

const moduleList = [...registeredModules.values()].map(({ module }) => module);

export const PortalContent = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.content}>
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
