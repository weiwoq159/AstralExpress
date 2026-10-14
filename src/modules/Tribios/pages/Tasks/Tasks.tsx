import { useMemo, useState } from "react";

import { SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Flex, Input, Typography } from "antd";

import { Hero, SectionHeader, TaskCard } from "@/shared/components";
import type { TaskStatus } from "@/shared/domain/task";
import { useManifestMap } from "@/shared/hooks/useManifest";
import { useTasks } from "@/shared/hooks/useTasks";

import { Tribios } from "@tribios/module";

import styles from "./Tasks.module.scss";

const { Text } = Typography;

type Filter = "all" | TaskStatus;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "全部任务" },
  { key: "running", label: "运行中" },
  { key: "pending", label: "等待中" },
  { key: "paused", label: "已暂停" },
  { key: "success", label: "已完成" },
  { key: "failed", label: "已失败" },
  { key: "canceled", label: "已取消" },
  { key: "interrupted", label: "已中断" },
];

export const Tasks = () => {
  const { manifestMap } = useManifestMap("tool");
  const { tasks, isError, error, refetch } = useTasks("tool");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (filter === "all" || task.status === filter) &&
          `${task.title} ${task.manifestKey}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [tasks, filter, search],
  );
  const activeCount = tasks.filter((task) => task.status === "running" || task.status === "pending").length;
  const completedCount = tasks.filter((task) => task.status === "success").length;

  return (
    <main className={styles.page}>
      <Hero
        eyebrow={`TASK QUEUE / ${Tribios.title}`}
        title="任务队列"
        description="每一项正在进行的工作，都有迹可循。"
        cover={Tribios.cover}
      >
        <Flex wrap className={styles.heroStats} aria-label="任务概览">
          {[
            { value: tasks.length, label: "个任务" },
            { value: activeCount, label: "个进行中" },
            { value: completedCount, label: "个已完成" },
          ].map(({ value, label }) => (
            <Flex key={label} align="baseline" className={styles.stat}>
              <Text strong className={styles.statValue}>
                {value}
              </Text>
              <Text>{label}</Text>
            </Flex>
          ))}
        </Flex>
      </Hero>
      <section className={styles.queue} aria-label="任务列表">
        <Flex align="center" justify="space-between" gap={16} wrap className={styles.toolbar}>
          <Input
            allowClear
            className={styles.search}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索任务名称或应用 Key…"
            aria-label="搜索任务"
          />
        </Flex>
        <Flex className={styles.categories} role="tablist" aria-label="按状态筛选">
          {filters.map((item) => {
            const count =
              item.key === "all" ? tasks.length : tasks.filter((task) => task.status === item.key).length;
            return (
              <Button
                key={item.key}
                type={filter === item.key ? "primary" : "text"}
                role="tab"
                aria-selected={filter === item.key}
                className={styles.category}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
                <span className={styles.count}>{count}</span>
              </Button>
            );
          })}
        </Flex>
        <SectionHeader
          sectionTitle={filters.find((item) => item.key === filter)?.label ?? ""}
          style={{ margin: "16px 0" }}
        />
        {isError ? (
          <Alert
            type="error"
            showIcon
            message="任务列表加载失败"
            description={error instanceof Error ? error.message : undefined}
            action={
              <Button size="small" onClick={() => refetch()}>
                重试
              </Button>
            }
          />
        ) : visibleTasks.length ? (
          <Flex vertical gap={16}>
            {visibleTasks.map((task) => (
              <TaskCard key={task.taskUid} task={task} manifest={manifestMap.get(task.manifestKey)} />
            ))}
          </Flex>
        ) : (
          <Empty description={tasks.length ? "没有找到匹配的任务，试试其他关键词或状态" : "还没有任务，去应用库运行一个队列应用吧"}>
            <Button
              type="primary"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
            >
              清除筛选
            </Button>
          </Empty>
        )}
      </section>
    </main>
  );
};
