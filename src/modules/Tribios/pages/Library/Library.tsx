import { Library as SharedLibrary, useLibrary } from "@/shared/features/Library";

import { useToolStore } from "@tribios/stores/useToolStore";

export const Library = () => {
  const library = useLibrary(useToolStore);

  return <SharedLibrary library={library} />;
};
