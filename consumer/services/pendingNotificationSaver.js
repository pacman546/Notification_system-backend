import Notification from '../../models/notificationModel.js'; 
import { getChannel } from '../../producer/services/mqService.js';

// Helper delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPendingNotificationSaver() {
  try {
    const channel = getChannel();

    await channel.assertQueue('notifications.delivery', { durable: true });

    channel.consume('notifications.delivery', async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Received notification message:', content);

          if (content.status === 'pending') {
            if (!content.userId) {
              throw new Error('userId is missing in message');
            }

            // Wait 2 minutes before saving the notification
            console.log(`⏳ Waiting 2 minutes before saving notification ${content.notificationId}`);
            await delay(2 * 60 * 1000);

            const notification = new Notification({
              userId: content.userId,
              notificationId: content.notificationId,
              status: content.status,
              message: content.message,
              timestamp: content.timestamp || new Date(),
            });

            await notification.save();
            console.log(`✔ Saved pending notification ${content.notificationId} to DB`);
          }

          channel.ack(msg);
        } catch (err) {
          console.error('[x] Error processing notification message:', err);
          channel.nack(msg, false, false);
        }
      }
    }, { noAck: false });

    console.log('Pending notification saver started, listening on notifications.delivery queue');

  } catch (err) {
    console.error('[x] Failed to start pending notification saver:', err);
  }
}

export default startPendingNotificationSaver;
