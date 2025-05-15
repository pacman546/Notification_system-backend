import connectDB from '../config/db.js';
import amqplib from 'amqplib';
import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js'; 

const RABBITMQ_URL = process.env.RABBITMQ_URL; 
const QUEUE_NAME = 'notifications.delivery';

// Helper delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectMongo() {
  await mongoose.connect('mongodb://localhost:27017/yourdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
}

async function startWorker() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB(); 
    }

    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = QUEUE_NAME;
    await channel.assertQueue(queue, { durable: true });

    console.log(`[*] Waiting for messages in ${queue}`);

    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          try {
            const data = JSON.parse(msg.content.toString());
            console.log('Received from MQ:', data);

            console.log(`⏳ Waiting 2 minutes before saving notification ${data.notificationId} to MongoDB`);
            await delay(2 * 60 * 1000);  // 2 minutes delay

            await Notification.findOneAndUpdate(
              { notificationId: data.notificationId },
              {
                userId: data.userId,
                notificationId: data.notificationId,
                status: data.status,
                message: data.message,
                timestamp: data.timestamp,
              },
              { upsert: true, new: true }
            );

            channel.ack(msg);
            console.log(`Notification ${data.notificationId} saved to MongoDB.`);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Worker error:', error);
  }
}

startWorker().catch(console.error);
