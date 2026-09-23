import { useNavigate } from "react-router";

import { Flex, Image, Typography } from "antd";

import logo from "@/assets/images/cn.png";

import styles from "./LayoutHeader.module.scss";

const { Text } = Typography;

interface LayoutHeaderProps {
  brandName: string;
  path: string;
}
export const LayoutHeader = ({ brandName, path }: LayoutHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Flex align="center">
      <Image
        alt="logo"
        preview={false}
        src={logo}
        style={{ marginRight: 16, cursor: "pointer" }}
        styles={{ image: { height: 64 } }}
        onClick={() => navigate("/")}
      />
      <Text className={styles.brandName} onClick={() => navigate(path)}>
        {brandName}
      </Text>
    </Flex>
  );
};
