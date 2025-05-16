import { Post } from '../../models/postModel.js';
import { User } from '../../models/userModel.js'; 

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find(); // No populate

    // Manually attach author data
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const author = await User.findById(post.author).select('name email');
      return {
        ...post.toObject(),
        author, 
      };
    }));

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};
