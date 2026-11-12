use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{redis_store::FinalizeResult, AppState};

#[derive(Debug, Deserialize)]
pub struct FinalizeRequest {
    pub reservation_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct FinalizeResponse {
    pub reservation_id: Uuid,
    pub quantity: i64,
}

pub async fn handler(
    State(state): State<AppState>,
    Json(body): Json<FinalizeRequest>,
) -> Result<Json<FinalizeResponse>, (StatusCode, Json<serde_json::Value>)> {
    match state.store.finalize(&body.reservation_id).await {
        Ok(FinalizeResult::Ok { quantity }) => Ok(Json(FinalizeResponse {
            reservation_id: body.reservation_id,
            quantity,
        })),
        Ok(FinalizeResult::NotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "reservation_not_found"})),
        )),
        Err(e) => {
            tracing::error!("finalize error: {e:#}");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "internal_error"})),
            ))
        }
    }
}