import { Link, type To } from "react-router";

import { Flex } from "antd";

import styles from "./SectionHeader.module.scss";

interface SectionHeaderProps {
  sectionTitle: string;
  viewAllPath?: To;
  style?: React.CSSProperties;
}

export const SectionHeader = ({ sectionTitle, viewAllPath, style }: SectionHeaderProps) => {
  return (
    <Flex align="center" justify="space-between" style={{ marginBottom: 14, ...style }}>
      <h2 className={styles.title}>{sectionTitle}</h2>
      {viewAllPath && (
        <Link to={viewAllPath} className={styles.viewAllLink} aria-label={`查看全部${sectionTitle}`}>
          查看全部
        </Link>
      )}
    </Flex>
  );
};
