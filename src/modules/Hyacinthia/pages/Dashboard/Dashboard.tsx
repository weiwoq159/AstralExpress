import { Hero } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Hyacinthia } from "@hyacinthia/module";

export const Dashboard = () => {
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Hyacinthia.title}
        description={Hyacinthia.description}
        tags={Hyacinthia.tags}
        cover={Hyacinthia.cover}
      />
      <h1>Dashboard</h1>
    </div>
  );
};
