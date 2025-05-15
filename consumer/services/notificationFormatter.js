import mongoose from 'mongoose';
import { User } from '../../models/userModel.js';
import { Post } from '../../models/postModel.js';

async function formatNotification(event) {
  const { type, actorId, targetId, postId } = event;

  if (!mongoose.Types.ObjectId.isValid(actorId) || !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new Error('Invalid actorId or targetId');
  }
  if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error('Invalid postId');
  }

  const [actor, target, post] = await Promise.all([
    User.findById(actorId),
    User.findById(targetId),
    postId ? Post.findById(postId) : Promise.resolve(null),
  ]);

  if (!actor || !target) {
    throw new Error('Actor or Target user not found');
  }

  let message = '';

  switch (type) {
    case 'LIKE':
      message = `${actor.name} liked your post titled '${post?.title || 'unknown'}'`;
      break;
    case 'COMMENT':
      message = `${actor.name} commented on your post titled '${post?.title || 'unknown'}'`;
      break;
    case 'FOLLOW':
      message = `${actor.name} started following you`;
      break;
    default:
      message = `${actor.name} did something`;
  }

  return {
    toUserId: target._id,
    message,
    eventType: type,
    timestamp: new Date(),
  };
}

export {
    formatNotification
}