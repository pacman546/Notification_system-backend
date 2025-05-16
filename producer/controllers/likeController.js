import { getChannel } from '../services/mqService.js';




async function likeEvent(req, res) {
  console.log('Connecting to RabbitMQ at:', process.env.RABBITMQ_URL);
console.log('Queue name:', process.env.QUEUE_NAME || 'notification.event');

  const { actorId, targetId, postId, type } = req.body;

  if (!actorId || !targetId || !postId || type !== 'LIKE') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const event = {
    type,
    actorId,
    targetId,
    postId,
    timestamp: new Date().toISOString(),
  };

  try {
    const channel = getChannel();
    await channel.sendToQueue('notification.event', Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
    console.log(`[→] Event sent to MQ: ${type} by ${actorId} on post ${postId}`);
    res.status(200).json({ message: 'Event queued successfully' });
  } catch (err) {
    console.error('[x] Error sending to MQ:', err);
    res.status(500).json({ message: 'Failed to queue event' });
  }
}

export {
    likeEvent
}