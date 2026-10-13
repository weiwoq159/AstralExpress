import type { LiveWeather } from "@/shared/domain/weather";
import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

export const fetchWeather = async (areaId: number): Promise<LiveWeather | null> => {
  if (!isTauri()) {
    return Promise.resolve(null);
  }
  return invokeApiCommand<LiveWeather>("fetch_weather", { areaId });
};
