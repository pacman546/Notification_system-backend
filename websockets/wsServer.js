import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { redisClient } from '../consumer/config/redisConfig.js';
import { getChannel } from '../producer/services/mqService.js';
const onlineUsers = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  
    wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
  
      let userId;
  
      ws.on('message', async (message) => {
        console.log('WS message received:', message.toString());
  
        try {
          const parsed = JSON.parse(message);
          console.log('Parsed message:', parsed);
  
          if (parsed.type === 'AUTH') {
            userId = parsed.userId;
            onlineUsers.set(userId, ws);
            console.log(`WebSocket authenticated for user ${userId}`);
  
            const redisKey = `notifications:buffer:${userId}`;
            const pending = await redisClient.lRange(redisKey, 0, -1);
            const pendingCount = pending.filter(msg => JSON.parse(msg).status === 'pending').length;
            console.log(`Pending messages for user ${userId}: ${pending.length}`);
  
            for (let msg of pending) {
              const parsedMsg = JSON.parse(msg);
              if (parsedMsg.status === 'pending') {
                ws.send(JSON.stringify({ type: 'NOTIFICATION', payload: parsedMsg }));
                console.log('Sent notification:', parsedMsg.notificationId || parsedMsg);
              }
            }
          }
  
          if (parsed.type === 'ACK' && userId) {
            const { notificationId } = parsed;
            const redisKey = `notifications:buffer:${userId}`;
            const all = await redisClient.lRange(redisKey, 0, -1);
          
            for (let i = 0; i < all.length; i++) {
              const entry = JSON.parse(all[i]);
              if (entry.notificationId === notificationId) {
                entry.status = 'delivered';
          
                const updatedEntry = JSON.stringify(entry);
          
                // 1. Update the Redis entry
                await redisClient.lSet(redisKey, i, updatedEntry);
                console.log(`ACK received. Updated Redis status for ${notificationId} to delivered`);
          
                // 2. Send to MQ before removing
                try {
                  const channel = getChannel();
                  const ackPayload = {
                    userId,
                    notificationId,
                    status: 'delivered',
                    message: entry.message,
                    timestamp: new Date().toISOString()
                  };
          
                  console.log('Sending ACK payload to MQ:', ackPayload);
                  await channel.sendToQueue(
                    'notifications.savemessages',
                    Buffer.from(JSON.stringify(ackPayload)),
                    { persistent: true }
                  );
                  console.log('Message sent to MQ');
                            
                  console.log(`Sent delivered status to MQ for notification ${notificationId}`);
                } catch (err) {
                  console.error('Failed to send ACK to MQ:', err);
                }
          
                // 3. Remove only this delivered entry
                await redisClient.lRem(redisKey, 1, updatedEntry);
                break;
              }
            }
          }
          
  
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      });
    });
}