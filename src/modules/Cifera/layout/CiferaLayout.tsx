import { AppLayout } from "@/shared/layouts";

import { Cifera } from "../module";
import { CiferaNavigation } from "../navigation";

export const CiferaLayout = () => {
  return <AppLayout module={Cifera} navigation={CiferaNavigation} />;
};
