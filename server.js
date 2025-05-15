import 'dotenv/config'; 

import http from 'http';
import express from 'express';
import { setupWebSocket } from './websockets/wsServer.js';
import { connectRedis } from './consumer/config/redisConfig.js';
import { connectRabbitMQ } from './producer/services/mqService.js';
async function startServer() {
  
  console.log('REDIS_URL:', process.env.REDIS_URL);

  await connectRedis();  
  await connectRabbitMQ();
  const app = express();
  const server = http.createServer(app);
    
  setupWebSocket(server);

  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer();
