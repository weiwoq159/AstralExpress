import { useEffect, useState } from "react";

import { Flex } from "antd";

import { useMount } from "ahooks";
import dayjs from "dayjs";

import styles from "./HubClock.module.scss";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export const HubClock = () => {
  const [now, setNow] = useState(() => dayjs());

  useMount(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  });

  return (
    <Flex vertical gap={6} className={styles.root} aria-label="当前时间">
      <time className={styles.time} dateTime={now.format("HH:mm:ss")}>
        {now.format("HH:mm")}
      </time>
      <span className={styles.date}>
        {WEEKDAYS[now.day()]} · {now.format("MM.DD")}
      </span>
    </Flex>
  );
};
