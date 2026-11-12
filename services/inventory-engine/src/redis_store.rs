use anyhow::{bail, Result};
use redis::{aio::ConnectionManager, AsyncCommands, Script};
use uuid::Uuid;

// Lua: atomic check-and-reserve
// KEYS[1] = stock:{productId}
// KEYS[2] = hold:{reservationId}
// ARGV[1] = quantity
// ARGV[2] = ttl seconds
// Returns: 1 ok, -1 not enough stock, -2 product not found
const RESERVE_SCRIPT: &str = r#"
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock == nil then return -2 end
local qty = tonumber(ARGV[1])
if stock < qty then return -1 end
redis.call('DECRBY', KEYS[1], qty)
redis.call('SET', KEYS[2], qty)
redis.call('EXPIRE', KEYS[2], tonumber(ARGV[2]))
return 1
"#;

// Lua: atomic finalize (remove hold, stock already decremented)
// KEYS[1] = hold:{reservationId}
// Returns: quantity finalized, or 0 if hold not found (already expired/released)
const FINALIZE_SCRIPT: &str = r#"
local qty = redis.call('GETDEL', KEYS[1])
if qty == nil then return 0 end
return tonumber(qty)
"#;

// Lua: atomic release (restore stock, remove hold)
// KEYS[1] = stock:{productId}
// KEYS[2] = hold:{reservationId}
// Returns: 1 ok, 0 hold not found
const RELEASE_SCRIPT: &str = r#"
local qty = redis.call('GETDEL', KEYS[2])
if qty == nil then return 0 end
redis.call('INCRBY', KEYS[1], tonumber(qty))
return 1
"#;

#[derive(Clone)]
pub struct RedisStore {
    conn: ConnectionManager,
    hold_ttl: u64,
}

impl RedisStore {
    pub async fn new(redis_url: &str, hold_ttl: u64) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let conn = ConnectionManager::new(client).await?;
        Ok(Self { conn, hold_ttl })
    }

    fn stock_key(product_id: &Uuid) -> String {
        format!("stock:{}", product_id)
    }

    fn hold_key(reservation_id: &Uuid) -> String {
        format!("hold:{}", reservation_id)
    }

    /// Seed stock for a product (called once at startup or by admin).
    /// Only sets if the key does not already exist (NX).
    pub async fn init_stock(&self, product_id: &Uuid, quantity: i64) -> Result<()> {
        let mut conn = self.conn.clone();
        let key = Self::stock_key(product_id);
        // SET key value NX - only if not exists
        let _: Option<String> = conn.set_options(
            &key,
            quantity,
            redis::SetOptions::default().conditional_set(redis::ExistenceCheck::NX),
        ).await?;
        Ok(())
    }

    /// Get current available stock.
    pub async fn get_stock(&self, product_id: &Uuid) -> Result<Option<i64>> {
        let mut conn = self.conn.clone();
        let val: Option<i64> = conn.get(Self::stock_key(product_id)).await?;
        Ok(val)
    }

    /// Atomically reserve stock. Returns the reservation_id on success.
    pub async fn reserve(
        &self,
        product_id: &Uuid,
        quantity: i64,
        reservation_id: &Uuid,
    ) -> Result<ReserveResult> {
        let mut conn = self.conn.clone();
        let result: i64 = Script::new(RESERVE_SCRIPT)
            .key(Self::stock_key(product_id))
            .key(Self::hold_key(reservation_id))
            .arg(quantity)
            .arg(self.hold_ttl)
            .invoke_async(&mut conn)
            .await?;
        match result {
            1 => Ok(ReserveResult::Ok),
            -1 => Ok(ReserveResult::InsufficientStock),
            -2 => Ok(ReserveResult::ProductNotFound),
            _ => bail!("Unexpected Lua result: {}", result),
        }
    }

    /// Finalize a hold (order paid). Hold removed, stock stays decremented.
    pub async fn finalize(&self, reservation_id: &Uuid) -> Result<FinalizeResult> {
        let mut conn = self.conn.clone();
        let qty: i64 = Script::new(FINALIZE_SCRIPT)
            .key(Self::hold_key(reservation_id))
            .invoke_async(&mut conn)
            .await?;
        if qty == 0 {
            Ok(FinalizeResult::NotFound)
        } else {
            Ok(FinalizeResult::Ok { quantity: qty })
        }
    }

    /// Release a hold (order cancelled/expired). Stock restored.
    pub async fn release(
        &self,
        product_id: &Uuid,
        reservation_id: &Uuid,
    ) -> Result<ReleaseResult> {
        let mut conn = self.conn.clone();
        let result: i64 = Script::new(RELEASE_SCRIPT)
            .key(Self::stock_key(product_id))
            .key(Self::hold_key(reservation_id))
            .invoke_async(&mut conn)
            .await?;
        if result == 1 {
            Ok(ReleaseResult::Ok)
        } else {
            Ok(ReleaseResult::NotFound)
        }
    }

    /// SSE: get stock for a list of product IDs in one round trip.
    pub async fn get_stocks(&self, product_ids: &[Uuid]) -> Result<Vec<(Uuid, i64)>> {
        if product_ids.is_empty() {
            return Ok(vec![]);
        }
        let mut conn = self.conn.clone();
        let keys: Vec<String> = product_ids.iter().map(Self::stock_key).collect();
        let values: Vec<Option<i64>> = conn.mget(&keys).await?;
        Ok(product_ids
            .iter()
            .zip(values)
            .map(|(id, qty)| (*id, qty.unwrap_or(0)))
            .collect())
    }
}

#[derive(Debug)]
pub enum ReserveResult {
    Ok,
    InsufficientStock,
    ProductNotFound,
}

#[derive(Debug)]
pub enum FinalizeResult {
    Ok { quantity: i64 },
    NotFound,
}

#[derive(Debug)]
pub enum ReleaseResult {
    Ok,
    NotFound,
}