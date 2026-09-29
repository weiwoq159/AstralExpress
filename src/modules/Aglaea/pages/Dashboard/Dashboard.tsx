import { Hero } from "@/shared/components";
import pageStyles from "@/shared/styles/page.module.scss";

import { Aglaea } from "@aglaea/module";

export const Dashboard = () => {
  return (
    <div className={pageStyles.page}>
      <Hero
        eyebrow="DASHBOARD"
        title={Aglaea.title}
        description={Aglaea.description}
        tags={Aglaea.tags}
        cover={Aglaea.cover}
      />
      <h1>Dashboard</h1>
    </div>
  );
};
