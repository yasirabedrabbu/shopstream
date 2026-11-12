use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct Config {
    pub redis_url: String,
    pub jwt_public_key_path: String,
    pub port: u16,
    pub hold_ttl_seconds: u64,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();
        Ok(Self {
            redis_url: std::env::var("REDIS_URL")
                .context("REDIS_URL must be set")?,
            jwt_public_key_path: std::env::var("JWT_PUBLIC_KEY_PATH")
                .context("JWT_PUBLIC_KEY_PATH must be set")?,
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8081".to_string())
                .parse()
                .context("PORT must be a number")?,
            hold_ttl_seconds: std::env::var("HOLD_TTL_SECONDS")
                .unwrap_or_else(|_| "600".to_string())
                .parse()
                .context("HOLD_TTL_SECONDS must be a number")?,
        })
    }
}