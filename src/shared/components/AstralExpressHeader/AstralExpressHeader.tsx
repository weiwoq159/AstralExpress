import { useState } from "react";
import { useNavigate } from "react-router";

import { Flex, Image, Typography } from "antd";

import { useInterval, useMount } from "ahooks";

import { fetchWeather } from "@/shared/api/weather";
import type { LiveWeather } from "@/shared/domain/weather";

import logo from "@/assets/images/cn.png";

import styles from "./AstralExpressHeader.module.scss";
const { Text } = Typography;

interface LayoutHeaderProps {
  brandName: string;
  path: string;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const pad = (value: number) => value.toString().padStart(2, "0");
const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const formatDate = (date: Date) => `${WEEKDAYS[date.getDay()]} · ${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;

export const AstralExpressHeader = ({ brandName, path }: LayoutHeaderProps) => {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<LiveWeather | null>(null);

  useInterval(() => setNow(new Date()), 15_000);

  useMount(() => {
    fetchWeather()
      .then(setWeather)
      .catch((error) => console.error(error));
  });

  return (
    <Flex align="center" justify="space-between" className={styles.root}>
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

      <Flex align="center" gap={10} className={styles.hud}>
        {weather && (
          <div className={styles.hudChip}>
            <svg
              className={styles.hudIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.6v3M12 18.4v3M21.4 12h-3M5.6 12h-3M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12M18.36 18.36l-2.12-2.12M7.76 7.76 5.64 5.64" />
            </svg>
            <div className={styles.hudFigures}>
              <span className={styles.hudValue}>{weather.temperature}°</span>
              <span className={styles.hudCaption}>
                {weather.weather} · {weather.city}
              </span>
            </div>
          </div>
        )}

        <div className={`${styles.hudChip} ${styles.hudClock}`}>
          <div className={styles.hudFigures}>
            <span className={styles.hudValue}>{formatTime(now)}</span>
            <span className={styles.hudCaption}>{formatDate(now)}</span>
          </div>
        </div>
      </Flex>
    </Flex>
  );
};
