import { useState } from "react";
import { useNavigate } from "react-router";

import { App, Button, Card, Descriptions, Divider, Flex, Typography } from "antd";

import type { Manifest } from "@/shared/domain/manifest";

import { createTask } from "../../../api";
import { ciferaNavigation } from "../../../navigation";
import { useTaskStore } from "../../../stores/useTaskStore";

import styles from "./MhxyCbgPetsRunner.module.scss";

const { Title, Paragraph } = Typography;

// 对应 plugins/crawler/mhxy-cbg-pets/main.py：固定请求 saleable_pet_name.js，
// manifest 里 "execute" method 的 params 是空数组，这里没有可配置的入参。
const TARGET_URL = "https://cbg-xyq.res.netease.com/js/saleable_pet_name.js?v=20190514";

type MhxyCbgPetsRunnerProps = { tool: Manifest };

export const MhxyCbgPetsRunner = ({ tool }: MhxyCbgPetsRunnerProps) => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const loadTasks = useTaskStore((state) => state.load);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createTask({
        moduleId: "crawler",
        manifestKey: tool.key,
        params: {},
      });
      await loadTasks();
      message.success("已加入任务队列");
      navigate(ciferaNavigation.tasks.path);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "创建任务失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={styles.card} classNames={{ body: styles.cardBody }}>
      <Title level={5} className={styles.title}>
        抓取范围
      </Title>
      <Paragraph type="secondary">
        该方案固定抓取藏宝阁梦幻西游的召唤兽编号与名称。目标地址已写在爬虫脚本里，无需额外配置，直接加入任务队列即可运行。
      </Paragraph>

      <Divider plain titlePlacement="start">
        运行说明
      </Divider>
      <Descriptions
        className={styles.descriptions}
        column={1}
        size="small"
        items={[
          { key: "target", label: "目标地址", children: TARGET_URL },
          { key: "steps", label: "抓取步骤", children: "请求召唤兽名单脚本，解析其中的 SaleablePetNameInfo" },
          {
            key: "output",
            label: "输出结构",
            children: "召唤兽[ { pet_id, name } ]，同一个名字可以对应多个 id",
          },
        ]}
      />

      <Flex justify="end" style={{ marginTop: 20 }}>
        <Button type="primary" loading={submitting} onClick={handleSubmit}>
          加入任务队列
        </Button>
      </Flex>
    </Card>
  );
};
