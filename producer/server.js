import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectRabbitMQ } from './services/mqService.js';
import likeRoutes from './routes/likeRoutes.js';



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
