use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    redis_store::ReserveResult,
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct ReserveRequest {
    pub product_id: Uuid,
    pub reservation_id: Uuid,
    pub quantity: i64,
}

#[derive(Debug, Serialize)]
pub struct ReserveResponse {
    pub reservation_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i64,
}

pub async fn handler(
    State(state): State<AppState>,
    Json(body): Json<ReserveRequest>,
) -> Result<(StatusCode, Json<ReserveResponse>), (StatusCode, Json<serde_json::Value>)> {
    if body.quantity < 1 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "quantity must be >= 1"})),
        ));
    }

    match state
        .store
        .reserve(&body.product_id, body.quantity, &body.reservation_id)
        .await
    {
        Ok(ReserveResult::Ok) => Ok((
            StatusCode::OK,
            Json(ReserveResponse {
                reservation_id: body.reservation_id,
                product_id: body.product_id,
                quantity: body.quantity,
            }),
        )),
        Ok(ReserveResult::InsufficientStock) => Err((
            StatusCode::CONFLICT,
            Json(serde_json::json!({"error": "insufficient_stock"})),
        )),
        Ok(ReserveResult::ProductNotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "product_not_found"})),
        )),
        Err(e) => {
            tracing::error!("reserve error: {e:#}");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "internal_error"})),
            ))
        }
    }
}