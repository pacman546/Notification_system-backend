import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js'; 
import { User } from '../models/userModel.js';
import { Post } from '../models/postModel.js';

dotenv.config();

async function seed() {
  try {
    await connectDB();

    
    await User.deleteMany({});
    await Post.deleteMany({});

 
    const userA = new User({ name: 'UserA' });
    const userB = new User({ name: 'UserB' });

    await userA.save();
    await userB.save();

    console.log('Users seeded:', userA._id, userB._id);

   
    const posts = [
      { title: 'First Post', content: 'Content for the first post', author: userA._id },
      { title: 'Second Post', content: 'Content for the second post', author: userB._id },
      { title: 'Third Post', content: 'Content for the third post', author: userA._id },
      { title: 'Fourth Post', content: 'Content for the first post', author: userA._id },
      { title: 'Fifth Post', content: 'Content for the second post', author: userB._id },
      { title: 'Sixth Post', content: 'Content for the third post', author: userA._id },
      { title: 'Seventh Post', content: 'Content for the first post', author: userA._id },
      { title: 'Eighth Post', content: 'Content for the second post', author: userB._id },
      { title: 'Ninth Post', content: 'Content for the third post', author: userA._id }
    ];

    await Post.insertMany(posts);
    console.log('Posts seeded');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
