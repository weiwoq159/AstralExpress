import { Hero } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Helektra } from "@helektra/module";

export const Dashboard = () => {
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Helektra.title}
        description={Helektra.description}
        tags={Helektra.tags}
        cover={Helektra.cover}
      />
      <h1>Dashboard</h1>
    </div>
  );
};
