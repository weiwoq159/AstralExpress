import { useState } from "react";

import { Flex } from "antd";

import { useMount } from "ahooks";
import dayjs from "dayjs";

import styles from "./Clock.module.scss";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export const Clock = () => {
  const [now, setNow] = useState(() => dayjs());

  useMount(() => {
    let timer: ReturnType<typeof setTimeout>;
    // 界面只显示到分钟，对齐到下一个整分钟再刷新，避免每秒无意义地重渲染
    const scheduleNextMinute = () => {
      timer = setTimeout(() => {
        setNow(dayjs());
        scheduleNextMinute();
      }, 60_000 - (Date.now() % 60_000));
    };
    scheduleNextMinute();
    return () => clearTimeout(timer);
  });

  return (
    <Flex vertical gap={6} className={styles.root} aria-label="当前时间">
      <time className={styles.time} dateTime={now.format("HH:mm")}>
        {now.format("HH:mm")}
      </time>
      <span className={styles.date}>
        {WEEKDAYS[now.day()]} · {now.format("MM.DD")}
      </span>
    </Flex>
  );
};
