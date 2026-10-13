import { AppLayout } from "@/shared/layouts";

import { Tribios } from "../module";
import { TribiosNavigation } from "../navigation";

export const TribiosLayout = () => {
  return <AppLayout module={Tribios} navigation={TribiosNavigation} />;
};
