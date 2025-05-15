import dotenv from 'dotenv';
import express from 'express';
import likeRoutes from './routes/likeRoutes.js';
import { connectRabbitMQ } from './services/mqService.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/like', likeRoutes);

async function startServer() {
    await connectRabbitMQ();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
