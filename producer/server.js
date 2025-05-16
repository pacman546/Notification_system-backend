import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; // ✅ Import CORS

import connectDB from '../config/db.js';
import { connectRabbitMQ } from './services/mqService.js';
import likeRoutes from './routes/likeRoutes.js';
import postRoutes from './routes/postRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/like', likeRoutes);
app.use('/posts', postRoutes);

async function startServer() {
    await connectRabbitMQ();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
