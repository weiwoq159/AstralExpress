import { Typography, Flex } from "antd";

import styles from "./SectionIndex.module.scss";

const { Text, Title } = Typography;

type SectionIndexProps = {
  index: string;
  title: string;
};
export const SectionIndex = ({ index, title }: SectionIndexProps) => {
  return (
    <Flex className={styles.sectionHeading} vertical>
      <Text className={styles.sectionIndex}>{index}</Text>
      <Title id="detail-overview-title" level={3}>
        {title}
      </Title>
    </Flex>
  );
};
