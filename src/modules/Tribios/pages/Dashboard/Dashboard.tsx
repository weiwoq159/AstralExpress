import { Col, Flex, Row, Statistic, Tag, Typography } from "antd";

import { GlassPanel, Hero } from "@/shared/components";

import { Tribios } from "@tribios/module";

export const Dashboard = () => {
  return (
    <Flex vertical gap={18}>
      <Hero
        eyebrow="DASHBOARD"
        title={Tribios.title}
        description={Tribios.description}
        tags={Tribios.tags}
        cover={Tribios.cover}
      />
    </Flex>
  );
};
