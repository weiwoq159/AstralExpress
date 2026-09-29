use crate::domain::response::ApiResponse;
use crate::weather;
use crate::weather::types::LiveWeather;

use tauri::AppHandle;

#[tauri::command(async)]
pub async fn fetch_weather(_app: AppHandle, area_id: u32) -> ApiResponse<LiveWeather> {
    ApiResponse::from(weather::current::fetch(area_id).await)
}
