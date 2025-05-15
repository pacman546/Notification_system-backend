import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  notificationId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
