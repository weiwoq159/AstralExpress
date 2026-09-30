import { listManifests } from "@/shared/api/plugins";

export const listCrawlers = () => listManifests("crawler");
