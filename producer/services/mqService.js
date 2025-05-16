import amqp from 'amqplib';

let channel;

async function connectRabbitMQ() {
  try {
    console.log('Connecting to RabbitMQ at:', process.env.RABBITMQ_URL);
    console.log('Queue name:', process.env.QUEUE_NAME || 'notification.event');
    console.log('Connecting to RabbitMQ');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('notification.event', { durable: true });
    await channel.assertQueue('notifications.savemessages', { durable: true });
    console.log('[✓] Connected to RabbitMQ');
  } catch (err) {
    console.error('[x] Failed to connect to RabbitMQ:', err);
    process.exit(1);
  }
}

function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}

export {
    connectRabbitMQ,
    getChannel
}