import Icon, { HomeOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

import { useQuery } from "@tanstack/react-query";

import { fetchWeather } from "@/shared/api/weather";

import styles from "./HubWeather.module.scss";

const { Text } = Typography;

export const HubWeather = () => {
  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: () => fetchWeather(110114),
  });

  return weather ? (
    <Flex align="center" gap={8} className={styles.root} aria-label="当前天气">
      <Icon component={HomeOutlined} style={{ fontSize: 24 }} />
      <Flex vertical gap={6}>
        <Text className={styles.temperature}>{weather.temperature}℃</Text>
        <Text className={styles.desc}>
          {weather.weather} · {weather.city}
        </Text>
      </Flex>
    </Flex>
  ) : null;
};
