import { redisClient } from '../config/redisConfig.js'; 

const DEDUP_KEY = 'notification:dedup';
const DEDUP_TTL_SECONDS = 300; 

async function isDuplicate(event) {
  const eventSignature = `${event.type}:${event.actorId}:${event.targetId}:${event.postId}`;

  const now = Date.now();

  // Remove old entries
  await redisClient.zRemRangeByScore(DEDUP_KEY, 0, now - DEDUP_TTL_SECONDS * 1000);

  // Check if eventSignature exists
  const score = await redisClient.zScore(DEDUP_KEY, eventSignature);
  if (score !== null) {
    console.log(`👀 Duplicate event detected: ${eventSignature}`);
    return true;
  }

  // Add current eventSignature with timestamp
  await redisClient.zAdd(DEDUP_KEY, {
    score: now,
    value: eventSignature
  });

  return false;
}

export {
    isDuplicate
}