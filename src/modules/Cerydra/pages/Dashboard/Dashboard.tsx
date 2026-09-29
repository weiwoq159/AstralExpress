import { Hero } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Cerydra } from "@cerydra/module";

export const Dashboard = () => {
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Cerydra.title}
        description={Cerydra.description}
        tags={Cerydra.tags}
        cover={Cerydra.cover}
      />
      <h1>Dashboard</h1>
    </div>
  );
};
