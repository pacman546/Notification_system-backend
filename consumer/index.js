import connectDB from '../config/db.js';
import 'dotenv/config';
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
  } catch (error) {
    console.error('[x] Consumer failed to start:', error);
    process.exit(1);
  }
}

startConsumer();
