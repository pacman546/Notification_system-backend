import { redisClient } from '../config/redisConfig.js';
import { getChannel } from '../../producer/services/mqService.js';

// Helper function to process pending messages
async function scanPendingMessagesAndPush() {
  try {
    const channel = getChannel();
    let cursor = '0';

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: 'notifications:*',
        COUNT: 100,
      });

      cursor = result.cursor;
      const foundKeys = result.keys;

      for (const key of foundKeys) {
        const messages = await redisClient.lRange(key, 0, -1);
      
        const userId = key.split(':')[1]; // Extract userId from key
      
        const pendingMessages = messages
          .map(msg => {
            try {
              return JSON.parse(msg);
            } catch {
              return null;
            }
          })
          .filter(msg => msg && msg.status === 'pending')
          .map(msg => ({ ...msg, userId })); // Add userId to each message
      
        for (const msg of pendingMessages) {
          channel.sendToQueue('notifications.delivery', Buffer.from(JSON.stringify(msg)), {
            persistent: true,
          });
        }
      
        if (pendingMessages.length > 0) {
          console.log(`✔ Pushed ${pendingMessages.length} pending messages from ${key}`);
        }
      }

    } while (cursor !== '0');
  } catch (err) {
    console.error('[x] Error in background Redis scan job:', err);
  }
}

// Background polling entry point
export function startPendingDeliveryWorker(intervalMinutes = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;

  setInterval(async () => {
    console.log(`🔄 Running background Redis scan for pending notifications...`);
    await scanPendingMessagesAndPush();
  }, intervalMs);

  // Run once immediately
  scanPendingMessagesAndPush();
}
