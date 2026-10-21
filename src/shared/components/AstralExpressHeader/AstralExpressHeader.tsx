import { useNavigate } from "react-router";

import { SettingOutlined } from "@ant-design/icons";
import { Layout, Flex, Image, Divider, Typography, Button } from "antd";

import logo from "@/assets/images/cn.png";

import { Clock } from "../Clock/Clock";
import { Weather } from "../Weather/Weather";

import styles from "./AstralExpressHeader.module.scss";

const { Header } = Layout;
const { Text } = Typography;

interface AstralExpressHeaderProps {
  path: string;
  title: string;
  subtitle: string;
  slogan: string;
}
export const AstralExpressHeader = ({ path, title, subtitle, slogan }: AstralExpressHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Header className={styles.header}>
      <Flex align="center" justify="space-between" className={styles.root}>
        <Flex align="center">
          <Image
            alt="logo"
            preview={false}
            src={logo}
            className={styles.logo}
            styles={{ image: { height: 46 } }}
            onClick={() => navigate("/")}
          />
          <Divider vertical className={styles.divider} />
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
          <Weather />
          <Divider vertical className={styles.divider} />
          <Clock />
          <Divider vertical className={styles.dividerBeforeAction} />
          <Button
            className={styles.glassBtn}
            icon={<SettingOutlined />}
            aria-label="设置"
            onClick={() => navigate("/settings")}
          />
        </Flex>
      </Flex>
    </Header>
  );
};
