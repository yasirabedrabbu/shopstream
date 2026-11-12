use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{redis_store::ReleaseResult, AppState};

#[derive(Debug, Deserialize)]
pub struct ReleaseRequest {
    pub product_id: Uuid,
    pub reservation_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct ReleaseResponse {
    pub reservation_id: Uuid,
    pub status: &'static str,
}

pub async fn handler(
    State(state): State<AppState>,
    Json(body): Json<ReleaseRequest>,
) -> Result<Json<ReleaseResponse>, (StatusCode, Json<serde_json::Value>)> {
    match state
        .store
        .release(&body.product_id, &body.reservation_id)
        .await
    {
        Ok(ReleaseResult::Ok) => Ok(Json(ReleaseResponse {
            reservation_id: body.reservation_id,
            status: "released",
        })),
        Ok(ReleaseResult::NotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "reservation_not_found"})),
        )),
        Err(e) => {
            tracing::error!("release error: {e:#}");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "internal_error"})),
            ))
        }
    }
}