import { Card, Collapse, Empty, Flex, Typography } from "antd";

import type { MethodDescriptor, ParamDescriptor, ParamKind } from "@/shared/domain/manifest";

import styles from "./ManifestMethods.module.scss";

const { Text } = Typography;

const paramKindLabel: Record<ParamKind, string> = {
  string: "文本",
  number: "数字",
  bool: "开关",
  enum: "枚举",
  path: "路径",
};

type ManifestMethodsProps = {
  methods: readonly MethodDescriptor[];
};

export const ManifestMethods = ({ methods }: ManifestMethodsProps) => (
  <Card className={styles.card} classNames={{ body: styles.cardBody }}>
    <div className={styles.title}>可调用方法</div>
    {methods.length === 0 ? (
      <Empty className={styles.empty} image={Empty.PRESENTED_IMAGE_SIMPLE} description="该应用未声明可调用方法" />
    ) : (
      <Collapse
        className={styles.collapse}
        ghost
        items={methods.map((method) => ({
          key: method.name,
          label: (
            <Flex align="baseline" gap={8}>
              <Text className={styles.methodLabel}>{method.label}</Text>
              <Text className={styles.methodName}>{method.name}</Text>
              <Text className={styles.methodCount}>
                {method.params.length === 0 ? "无需参数" : `${method.params.length} 项参数`}
              </Text>
            </Flex>
          ),
          children: <ParamList params={method.params} />,
        }))}
      />
    )}
  </Card>
);

const ParamList = ({ params }: { params: readonly ParamDescriptor[] }) => {
  if (params.length === 0) {
    return <Text className={styles.noParams}>无需参数</Text>;
  }

  return (
    <Flex vertical gap={6} className={styles.params}>
      {params.map((param) => (
        <Flex key={param.name} justify="space-between" align="center" className={styles.param}>
          <Flex vertical>
            <Text className={styles.paramLabel}>{param.label}</Text>
            <Text className={styles.paramName}>{param.name}</Text>
          </Flex>
          <Flex gap={6} align="center">
            <span className={styles.paramKind}>{paramKindLabel[param.kind]}</span>
            {param.required && <span className={styles.paramRequired}>必填</span>}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};
