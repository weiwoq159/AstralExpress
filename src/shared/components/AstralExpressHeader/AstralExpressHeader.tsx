import { useNavigate } from "react-router";

import { SettingOutlined } from "@ant-design/icons";
import { Flex, Image, Typography, Divider, Button, Layout } from "antd";

import logo from "@/assets/images/cn.png";

import { HubClock } from "../HubClock/HubClock";
import { HubWeather } from "../HubWeather/HubWeather";

import styles from "./AstralExpressHeader.module.scss";

const { Header } = Layout;
const { Text } = Typography;

type AstralExpressHeaderProps = {
  path: string;
  title: string;
  subtitle: string;
  slogan: string;
};

export const AstralExpressHeader = ({ path, title, subtitle, slogan }: AstralExpressHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Header className={styles.header}>
      <Flex align="center" justify="space-between" className={styles.root}>
        <Flex align="center" style={{ padding: "12px" }}>
          <Image
            alt="logo"
            preview={false}
            src={logo}
            className={styles.logo}
            styles={{ image: { height: 52 } }}
            onClick={() => navigate("/")}
          />
          <Divider vertical style={{ height: 24 }} />
          <Flex vertical style={{ padding: "12px" }}>
            <Typography.Title level={4} className={styles.title}>
              {title}
            </Typography.Title>
            <Text className={styles.subtitle} onClick={() => navigate(path)}>
              {subtitle} · {slogan}
            </Text>
          </Flex>
        </Flex>
        <Flex align="center">
          <HubWeather />
          <Divider vertical style={{ height: 24 }} />
          <HubClock />
          <Divider vertical style={{ height: 24, marginRight: 22 }} />
          <Button className={styles.glassBtn} icon={<SettingOutlined />} aria-label="设置" />
        </Flex>
      </Flex>
    </Header>
  );
};
