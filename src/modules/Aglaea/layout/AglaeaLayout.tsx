import { AppLayout } from "@/shared/layouts";

import { Aglaea } from "../module";
import { AglaeaNavigation } from "../navigation";

export const AglaeaLayout = () => {
  return <AppLayout module={Aglaea} navigation={AglaeaNavigation} />;
};
