use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Deserialize)]
pub struct LiveWeatherResponse {
    pub status: String,
    pub info: String,
    #[serde(default)]
    pub lives: Vec<LiveWeather>,
}

#[derive(Debug, Clone, Deserialize, Serialize, TS)]
#[ts(export, export_to = "weather.ts")]
pub struct LiveWeather {
    pub province: String,
    pub city: String,
    pub adcode: String,
    pub weather: String,
    pub temperature: String,
    pub winddirection: String,
    pub windpower: String,
    pub humidity: String,
    pub reporttime: String,
}
