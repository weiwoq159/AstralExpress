import { listManifests } from "@/shared/api/plugins";

export const listTools = () => listManifests("tools");
