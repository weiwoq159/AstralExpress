import { useId } from "react";
import { Link, useNavigate } from "react-router";

import { ArrowLeftOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { AppIcon } from "@/shared/components";
import type { ManifestStatus } from "@/shared/domain/manifest";

import { manifestStatusLabel, manifestStatusTone } from "../../config/manifestStatus";

import styles from "./ManifestHeader.module.scss";

const { Text, Title } = Typography;

type ManifestHeaderProps = {
  icon: string;
  name: string;
  description: string;
  status: ManifestStatus;
  /** 返回链接的路径，用固定路径而不是 history.back()，直接从这个页面打开也不会跳出站外。 */
  backTo: string;
  backLabel?: string;
  /** 提供时在头部展示"运行"按钮；未提供时不展示（比如运行页自己就不需要这个按钮）。 */
  runTo?: string;
};

export const ManifestHeader = ({
  icon,
  name,
  description,
  status,
  backTo,
  backLabel = "返回应用库",
  runTo,
}: ManifestHeaderProps) => {
  const titleId = useId();
  const navigate = useNavigate();
  const runDisabled = status !== "available";

  return (
    <section className={styles.header} aria-labelledby={titleId}>
      <Link to={backTo} className={styles.backLink}>
        <ArrowLeftOutlined aria-hidden="true" /> {backLabel}
      </Link>
      <Flex justify="space-between" align="flex-start" wrap gap={16} className={styles.body}>
        <Flex align="flex-start" gap={16}>
          <Text className={styles.icon} aria-hidden="true">
            <AppIcon icon={icon} />
          </Text>
          <div>
            <Title id={titleId} level={2} className={styles.title}>
              {name}
            </Title>
            <Text className={styles.description}>{description}</Text>
          </div>
        </Flex>
        <Flex align="center" gap={10}>
          <span className={styles.status} data-tone={manifestStatusTone[status]}>
            {manifestStatusLabel[status]}
          </span>
          {runTo && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              disabled={runDisabled}
              title={runDisabled ? "当前应用不可用" : undefined}
              onClick={() => navigate(runTo)}
            >
              运行
            </Button>
          )}
        </Flex>
      </Flex>
    </section>
  );
};
