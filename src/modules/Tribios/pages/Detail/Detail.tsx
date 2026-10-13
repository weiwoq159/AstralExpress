import { useParams } from "react-router";

import { ManifestDetail } from "@/shared/components";

import { TribiosNavigation } from "@tribios/navigation";

export const Detail = () => {
  const { key } = useParams();

  return (
    <ManifestDetail
      moduleId="tool"
      manifestKey={key as string}
      backPath={TribiosNavigation.library.path}
      getRunPath={(manifestKey) => `${TribiosNavigation.library.path}/${encodeURIComponent(manifestKey)}/run`}
    />
  );
};
