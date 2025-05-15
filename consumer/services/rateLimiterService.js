import { redisClient } from '../config/redisConfig.js';

const RATE_LIMIT_PREFIX = 'rate_limit:';
const MAX_EVENTS = 2;
const WINDOW_SECONDS = 10;

async function isThrottled(userId) {
  const key = `${RATE_LIMIT_PREFIX}${userId}`;

  const pipeline = redisClient.multi();

  // Increment and set expiry if not exists (NX ensures TTL only on first set)
  pipeline.incr(key);
  pipeline.expire(key, WINDOW_SECONDS); // always reset TTL, safe default

  const [currentCount, ttlSet] = await pipeline.exec();

  console.log(`[RateLimiter] ${key} = ${currentCount}`);
  console.log(`[RateLimiter] TTL set success: ${ttlSet}`);

  if (currentCount > MAX_EVENTS) {
    console.warn(`🚫 User ${userId} exceeded rate limit (${currentCount} events in ${WINDOW_SECONDS}s)`);
    return true;
  }

  console.log(`⏳ Rate check passed: ${currentCount}/${MAX_EVENTS} in window`);
  return false;
}

export {
    isThrottled
}