import connectDB from '../config/db.js';
import 'dotenv/config';
import express from 'express';  
import { connectAndConsume } from './services/mqConsumerService.js';
import { connectRedis } from './config/redisConfig.js';
import { connectRabbitMQ } from '../producer/services/mqService.js';
import { startPendingDeliveryWorker } from './services/pendingDeliveryWorker.js';
import startPendingNotificationSaver from './services/pendingNotificationSaver.js';

async function startConsumer() {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ(); 
    await connectAndConsume();

    startPendingDeliveryWorker(5);
    startPendingNotificationSaver();
    console.log('Consumer started and listening for messages...');

    
    const healthApp = express();
    const HEALTH_PORT = process.env.HEALTH_PORT || 3001;

    healthApp.get('/health', (req, res) => res.send('OK'));

    healthApp.listen(HEALTH_PORT, () => {
      console.log(`Healthcheck server listening on port ${HEALTH_PORT}`);
    });

  } catch (error) {
    console.error('[x] Consumer failed to start:', error);
    process.exit(1);
  }
}

startConsumer();
