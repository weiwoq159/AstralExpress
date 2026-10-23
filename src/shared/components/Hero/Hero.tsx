import { useId, useState, type ReactNode } from "react";

import { Flex, Image, Tag, Typography } from "antd";

import { AppIcon } from "@/shared/components";

import styles from "./Hero.module.scss";
const { Text, Title } = Typography;

export interface HeroProps {
  title: string;
  eyebrow?: string;
  description?: string;
  tags?: readonly string[];
  cover?: string;
  className?: string;
  icon?: string;
  children?: ReactNode;
}

export const Hero = ({ title, eyebrow, description, tags = [], cover, className, icon, children }: HeroProps) => {
  const titleId = useId();
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const showCover = Boolean(cover && cover !== failedCover);

  return (
    <section
      className={[styles.hero, !showCover && styles.noCover, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      {showCover ? (
        <Image
          src={cover}
          alt=""
          preview={false}
          classNames={{ root: styles.coverRoot, image: styles.cover }}
          onError={() => setFailedCover(cover ?? null)}
        />
      ) : (
        <Flex className={styles.emptyArt} aria-hidden="true" />
      )}
      <Flex vertical className={styles.copy}>
        {eyebrow && <Text className={styles.eyebrow}>{eyebrow}</Text>}
        <Flex>
          {icon && <AppIcon icon={icon} className={styles.icon} />}

          <Title id={titleId} level={1} className={styles.title}>
            {title}
          </Title>
        </Flex>
        {description && <Text className={styles.description}>{description}</Text>}
        {children}
        {tags.length > 0 && (
          <Flex wrap gap={8} className={styles.tags} aria-label="功能标签">
            {tags.map((tag) => (
              <Tag key={tag} className={styles.tag}>
                {tag}
              </Tag>
            ))}
          </Flex>
        )}
      </Flex>
      <Text className={styles.cornerMark} aria-hidden="true">
        ASTRAL EXPRESS
      </Text>
    </section>
  );
};
