/**
 * 高德天气 `weather` 字段（如“中雨”“沙尘暴”）到 iconfont symbol 的归类。
 * 按从具体到笼统的顺序匹配，命中即止；未命中落到 "icon-weizhi"（未知）。
 */
const WEATHER_ICON_RULES: Array<[RegExp, string]> = [
  [/龙卷/, "icon-longjuanfeng"],
  [/台风|飓风|热带风暴/, "icon-taifeng"],
  [/狂爆风|风暴|烈风/, "icon-kuangfeng"],
  [/大风|疾风|劲风|强风/, "icon-dafeng"],
  [/暴雪/, "icon-baoxue"],
  [/雨夹雪|雨雪/, "icon-yujiaxue"],
  [/中雪/, "icon-zhongxue"],
  [/小雪/, "icon-xiaoxue"],
  [/阵雪/, "icon-zhenxue"],
  [/冻雨/, "icon-dongyu"],
  [/冰雹/, "icon-leibao"],
  [/雷阵雨/, "icon-leizhenyu"],
  [/特大暴雨/, "icon-tedabaoyu"],
  [/大暴雨/, "icon-dabaoyu"],
  [/暴雨/, "icon-baoyu"],
  [/强阵雨|大雨/, "icon-dayu"],
  [/中雨/, "icon-zhongyu"],
  [/阵雨/, "icon-zhenyu"],
  [/小雨/, "icon-xiaoyu"],
  [/沙尘暴/, "icon-shachenbao"],
  [/扬沙/, "icon-yangsha"],
  [/浮尘/, "icon-fuchen"],
  [/浓雾|大雾/, "icon-baowu"],
  [/雾/, "icon-wu"],
  [/霾/, "icon-mai"],
  [/多云|少云/, "icon-duoyun"],
  [/晴/, "icon-qing"],
  [/阴/, "icon-yin"],
  [/^热$/, "icon-gaowen"],
  [/^冷$/, "icon-diwen"],
  [/风/, "icon-weifeng"],
];

export const resolveWeatherIcon = (weather: string) =>
  WEATHER_ICON_RULES.find(([pattern]) => pattern.test(weather))?.[1] ?? "icon-weizhi";
