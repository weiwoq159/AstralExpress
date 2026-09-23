import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router";

import { GlobalOutlined } from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";

import { getUrlHostname } from "@/shared/utils";

import { AppIcon } from "../../AppIcon/AppIcon";

import styles from "./QuickAccessGrid.module.scss";

const { Text } = Typography;

export type QuickAccessItem = {
  key: string;
  name: string;
  description: string;
  icon: string;
  /** 详情页路由。**未提供时卡片照常展示，但不可点击也不可聚焦**。 */
  link?: string;
  targetWebsite?: string | null;
};

type QuickAccessGridProps = { items: readonly QuickAccessItem[]; limit?: number };

export const QuickAccessGrid = ({ items, limit = 8 }: QuickAccessGridProps) => {
  const navigate = useNavigate();
  const quickAccessItems = items.slice(0, limit);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, link: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(link);
    }
  };

  return (
    <Row gutter={[24, 24]}>
      {quickAccessItems.map((item) => {
        const link = item.link;
        return (
          <Col xs={12} sm={12} md={8} lg={6} key={item.key}>
            <Card
              hoverable={link !== undefined}
              className={styles.card}
              classNames={{ body: styles.cardBody }}
              {...(link === undefined
                ? {}
                : {
                    onClick: () => navigate(link),
                    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => handleKeyDown(event, link),
                    "aria-label": `查看${item.name}详情`,
                    role: "button",
                    tabIndex: 0,
                  })}
            >
              <Text className={styles.icon} aria-hidden="true">
                <AppIcon icon={item.icon} />
              </Text>
              <Text className={styles.title}>{item.name}</Text>
              <Text className={styles.description}>{item.description}</Text>
              {item.targetWebsite && (
                <Text className={styles.targetWebsite} title={item.targetWebsite}>
                  <GlobalOutlined aria-hidden="true" /> {getUrlHostname(item.targetWebsite)}
                </Text>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};
