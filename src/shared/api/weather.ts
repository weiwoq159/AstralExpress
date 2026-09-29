import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

import type { LiveWeather } from "@/shared/domain/weather";

export const fetchWeather = async (): Promise<LiveWeather | null> => {
  if (!isTauri()) {
    return Promise.resolve(null);
  }
  return invokeApiCommand<LiveWeather>("fetch_weather", { areaId: 110114 });
};
