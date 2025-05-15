import amqp from 'amqplib';
import { processEvent } from '../processors/eventProcessor.js';

const QUEUE_NAME = process.env.QUEUE_NAME || 'notifications.events';
const RABBITMQ_URL = process.env.RABBITMQ_URL;

async function connectAndConsume() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('📩 Received message:', content);

          await processEvent(content); // delegate to processor
          channel.ack(msg);
        } catch (err) {
          console.error('[x] Failed to process message:', err);
          // optionally: channel.nack(msg, false, false) to drop
        }
      }
    },
    { noAck: false }
  );
}

export {
  connectAndConsume
}