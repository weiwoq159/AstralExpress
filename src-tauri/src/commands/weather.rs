use crate::domain::{response::ApiResponse, weather::LiveWeather};
use crate::weather;

use tauri::AppHandle;

#[tauri::command(async)]
pub async fn fetch_weather(_app: AppHandle, area_id: u32) -> ApiResponse<LiveWeather> {
    ApiResponse::from(weather::current::fetch(area_id).await)
}
