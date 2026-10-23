use crate::shared::response::ApiResponse;

use super::current;
use super::domain::LiveWeather;

use tauri::AppHandle;

#[tauri::command(async)]
pub async fn fetch_weather(_app: AppHandle, area_id: u32) -> ApiResponse<LiveWeather> {
    ApiResponse::from(current::fetch(area_id).await)
}
