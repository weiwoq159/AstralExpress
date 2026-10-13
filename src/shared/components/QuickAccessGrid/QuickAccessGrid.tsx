import { Link, type To } from "react-router";

import { Row, Col, Typography } from "antd";

import { AppIcon, GlassPanel } from "@/shared/components";
import type { Manifest } from "@/shared/domain/manifest";

import styles from "./QuickAccessGrid.module.scss";

const { Text } = Typography;

type QuickAccessGridProps = {
  manifests: readonly Manifest[];
  getItemPath: (manifest: Manifest) => To;
};

export const QuickAccessGrid = ({ manifests, getItemPath }: QuickAccessGridProps) => {
  return (
    <Row gutter={[24, 24]}>
      {manifests.map((manifest) => (
        <Col key={manifest.key} span={6}>
          <Link to={getItemPath(manifest)} className={styles.link} aria-label={`打开${manifest.name}`}>
            <GlassPanel hoverable>
              <Text className={styles.icon} aria-hidden="true">
                <AppIcon icon={manifest.icon} />
              </Text>
              <Text className={styles.title}>{manifest.name}</Text>
              <Text className={styles.description}>{manifest.description}</Text>
            </GlassPanel>
          </Link>
        </Col>
      ))}
    </Row>
  );
};
