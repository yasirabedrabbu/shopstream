use std::time::Duration;

use async_stream::stream;
use axum::{
    extract::{Query, State},
    response::sse::{Event, KeepAlive, Sse},
};
use serde::Deserialize;
use tokio_stream::Stream;
use uuid::Uuid;

use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct SseQuery {
    /// Comma-separated product UUIDs: ?products=uuid1,uuid2
    pub products: String,
}

pub async fn handler(
    State(state): State<AppState>,
    Query(query): Query<SseQuery>,
) -> Sse<impl Stream<Item = Result<Event, std::convert::Infallible>>> {
    let product_ids: Vec<Uuid> = query
        .products
        .split(',')
        .filter_map(|s| Uuid::parse_str(s.trim()).ok())
        .take(50) // max 50 products per connection
        .collect();

    let store = state.store.clone();

    let s = stream! {
        loop {
            match store.get_stocks(&product_ids).await {
                Ok(stocks) => {
                    let payload: Vec<serde_json::Value> = stocks
                        .iter()
                        .map(|(id, qty)| serde_json::json!({
                            "productId": id,
                            "stock": qty
                        }))
                        .collect();
                    let data = serde_json::to_string(&payload).unwrap_or_default();
                    yield Ok(Event::default().event("stock").data(data));
                }
                Err(e) => {
                    tracing::error!("SSE stock fetch error: {e:#}");
                    yield Ok(Event::default().event("error").data("internal_error"));
                }
            }
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    };

    Sse::new(s).keep_alive(KeepAlive::default())
}