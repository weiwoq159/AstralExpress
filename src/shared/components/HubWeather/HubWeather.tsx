import { Flex, Typography } from "antd";

import { useQuery } from "@tanstack/react-query";

import { fetchWeather } from "@/shared/api/weather";
import { AppIcon } from "@/shared/components/AppIcon/AppIcon";

import styles from "./HubWeather.module.scss";
import { resolveWeatherIcon } from "./weatherIcon";

const { Text } = Typography;

export const HubWeather = () => {
  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: () => fetchWeather(110114),
  });

  return weather ? (
    <Flex align="center" gap={8} className={styles.root} aria-label="当前天气">
      <AppIcon icon={resolveWeatherIcon(weather.weather)} style={{ fontSize: 24 }} />
      <Flex vertical gap={6}>
        <Text className={styles.temperature}>{weather.temperature}℃</Text>
        <Text className={styles.desc}>
          {weather.weather} · {weather.city}
        </Text>
      </Flex>
    </Flex>
  ) : null;
};
