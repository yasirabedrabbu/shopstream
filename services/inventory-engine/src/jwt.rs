use anyhow::{Context, Result};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: u64,
    pub role: Option<String>,
}

#[derive(Clone)]
pub struct JwtVerifier {
    key: DecodingKey,
    validation: Validation,
}

impl JwtVerifier {
    pub fn from_pem_file(path: &str) -> Result<Self> {
        let pem = std::fs::read(path)
            .with_context(|| format!("Cannot read public key: {path}"))?;
        let key = DecodingKey::from_rsa_pem(&pem)
            .context("Invalid RSA public key PEM")?;
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&["shopstream"]);
        // audience not set - Java does not set aud
        Ok(Self { key, validation })
    }

    pub fn verify(&self, token: &str) -> Result<Claims> {
        let data = decode::<Claims>(token, &self.key, &self.validation)
            .context("JWT verification failed")?;
        Ok(data.claims)
    }

    pub fn verify_user_id(&self, token: &str) -> Result<Uuid> {
        let claims = self.verify(token)?;
        Uuid::parse_str(&claims.sub).context("sub is not a valid UUID")
    }
}