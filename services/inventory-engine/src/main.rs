mod config;
mod jwt;
mod redis_store;
mod routes;

use std::net::SocketAddr;

use anyhow::Result;
use axum::{
    middleware,
    routing::{get, post},
    Router,
};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use crate::{config::Config, jwt::JwtVerifier, redis_store::RedisStore};

#[derive(Clone)]
pub struct AppState {
    pub store: RedisStore,
    pub jwt: JwtVerifier,
    pub config: Config,
}

/// Axum extractor middleware: verify Bearer JWT, attach to request extensions.
mod auth {
    use axum::{
        extract::{Request, State},
        http::StatusCode,
        middleware::Next,
        response::Response,
        Json,
    };
    use uuid::Uuid;

    use crate::AppState;

    #[derive(Clone)]
    pub struct AuthUser(pub Uuid);

    pub async fn require_jwt(
        State(state): State<AppState>,
        mut req: Request,
        next: Next,
    ) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "))
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(serde_json::json!({"error": "missing_token"})),
                )
            })?;

        let user_id = state.jwt.verify_user_id(token).map_err(|e| {
            tracing::warn!("JWT rejected: {e}");
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({"error": "invalid_token"})),
            )
        })?;

        req.extensions_mut().insert(AuthUser(user_id));
        Ok(next.run(req).await)
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env()?;
    let store = RedisStore::new(&config.redis_url, config.hold_ttl_seconds).await?;
    let jwt = JwtVerifier::from_pem_file(&config.jwt_public_key_path)?;

    let state = AppState {
        store,
        jwt,
        config: config.clone(),
    };

    let protected = Router::new()
        .route("/reserve", post(routes::reserve::handler))
        .route("/finalize", post(routes::finalize::handler))
        .route("/release", post(routes::release::handler))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth::require_jwt,
        ));

    // SSE is public (vendor page can call it without re-authing)
    // but rate-limited by connections per IP in production (not implemented here)
    let public = Router::new().route("/stream", get(routes::sse::handler));

    let app = Router::new()
        .merge(protected)
        .merge(public)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("inventory-engine listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}