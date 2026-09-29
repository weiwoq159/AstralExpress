use tauri_plugin_http::reqwest;

use super::types::{LiveWeather, LiveWeatherResponse};

const AMAP_KEY: &str = "45454eef0a5eb7eeda64adb709100dbc";

pub async fn fetch(area_id: u32) -> Result<LiveWeather, String> {
    let url =
        format!("https://restapi.amap.com/v3/weather/weatherInfo?city={area_id}&key={AMAP_KEY}");

    let res = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let bytes = res.bytes().await.map_err(|e| e.to_string())?;

    let body: LiveWeatherResponse = serde_json::from_slice(&bytes).map_err(|e| e.to_string())?;

    if body.status != "1" {
        return Err(body.info);
    }

    body.lives
        .into_iter()
        .next()
        .ok_or_else(|| "no live weather data returned".to_string())
}
