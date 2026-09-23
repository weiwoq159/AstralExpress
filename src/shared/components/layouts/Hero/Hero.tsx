import { useId } from "react";

import { Flex, Typography, Tag } from "antd";

import styles from "./Hero.module.scss";

const { Text, Title } = Typography;

interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  tags: readonly string[];
}

export const Hero = ({ eyebrow, title, description, tags }: HeroProps) => {
  const titleId = useId();

  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.heroMain}>
        <Text strong style={{ color: "#4d789d", letterSpacing: "0.14em" }}>
          {eyebrow}
        </Text>
        <Title id={titleId} level={1} style={{ marginTop: 16, color: "#102a43", lineHeight: 1.2 }}>
          {title}
        </Title>
        <Text style={{ marginTop: 12, color: "#4d789d", letterSpacing: "0.14em" }}>{description}</Text>
        <Flex wrap gap={8} style={{ marginTop: 18 }} aria-label="功能标签">
          {tags.map((tag) => (
            <Tag key={tag} className={styles.tag}>
              {tag}
            </Tag>
          ))}
        </Flex>
      </div>
    </section>
  );
};
