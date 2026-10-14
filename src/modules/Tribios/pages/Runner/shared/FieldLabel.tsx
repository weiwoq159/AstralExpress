import { Flex, Typography } from "antd";

import styles from "./RunnerShared.module.scss";

interface Props {
  htmlFor: string;
  text: string;
  required?: boolean;
}

export const FieldLabel = ({ htmlFor, text, required }: Props) => (
  <Flex justify="space-between" gap={8} className={styles.fieldLabel}>
    <label htmlFor={htmlFor}>
      <Typography.Text strong>{text}</Typography.Text>
    </label>
    {required && <Typography.Text className={styles.required}>必填</Typography.Text>}
  </Flex>
);
