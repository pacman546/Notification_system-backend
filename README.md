# Insyd Notification System - Scalable Backend (POC)

This is a production-grade, proof-of-concept backend for **Insyd**, a next-gen social web platform for the Architecture industry. The system is designed to handle **high-throughput notification workloads** (like, comment, follow, etc.) at scale — capable of supporting **10K-100K DAU** — while being **cost-effective**, **lightweight**, and **non-blocking** to core features like feed rendering and content publishing.

---

## Features

✅ Decoupled Notification Pipeline using **RabbitMQ**  
✅ Real-Time Delivery via **WebSockets** + **Redis TTL Buffer**  
✅ **Async, Delayed Persistence** of notifications to reduce DB load  
✅ Smart **Deduplication**, **Rate Limiting**, **Schema check to avoid bad payload** and **Priority Handling**  
✅ Clean, modular monorepo structure (Producer, Consumer, WS Server, Worker)  
✅ Deployed as **4 independent services** on Railway.app  
✅ No user-auth overhead for this POC — clean simulation via Postman/WebSocket  

---

## System Design Highlights

> See detailed design: https://www.figma.com/board/dT3x1wsipRmHFr3eKAMf9K/Welcome-to-FigJam?node-id=0-1&p=f&t=NnnqIvN7nrB1u0Ar-0

- **Lightweight & Non-blocking**: Notifications are handled entirely out-of-band via MQ + Redis.
- **Cost-efficient**: Batching + delayed writes prevent DB overuse. TTL caching avoids reads for expired or seen notifications.
- **Horizontally Scalable**: Each component can be scaled independently — producers, consumers, WebSocket servers, workers.
- **Delivery Optimized**: Real-time if online, deferred otherwise. ACK system ensures reliable delivery tracking.

---

## Tech Stack

- **Node.js** (ESModules)
- **Express.js**
- **MongoDB** + Mongoose
- **Redis** (TTL + Async Queue)
- **RabbitMQ** (AMQP Events)
- **WebSockets** (Real-Time Layer)
- **Railway.app** (Multi-service Deployment)

---

## Project Structure

```
├── config/                        # DB Configuration
│   └── db.js                      # MongoDB connection setup
├── models/                        # Mongoose Schemas (User, Post, Notification)
│   ├── userModel.js
│   ├── postModel.js
│   └── notificationModel.js
├── consumer/                      # RabbitMQ Consumers & Notification Handlers
│   ├── config/
│   │   └── redisConfig.js         # Redis Client Configuration
│   ├── processors/
│   │   └── eventProcessor.js      # Validates, formats, deduplicates and buffers notifications
│   ├── services/
│   │   ├── deduplicationService.js       # Prevents duplicate notifications
│   │   ├── formatService.js              # Adds readable context to notifications
│   │   ├── priorityService.js            # Flags transactional/promotional
│   │   ├── rateLimiterService.js         # Prevents spamming
│   │   ├── redisNotificationBuffer.js    # Temporary Redis TTL buffer
│   │   ├── pendingDeliveryWorker.js      # Tracks undelivered notifications
│   │   └── pendingNotificationSaver.js   # Persists undelivered notifications with delay
│   └── validators/
│       └── eventSchema.js         # Joi schema for payload validation
├── jobs/
│   └── worker.js                  # Async Worker to save delivered messages to DB
├── producer/                      # Simulated Activity Producers
│   ├── controllers/
│   │   ├── likeController.js      # Simulates "like" events
│   │   └── postController.js      # Dummy feed APIs
│   ├── routes/
│   │   ├── likeRoutes.js
│   │   └── postRoutes.js
│   └── services/
│       ├── mqService.js           # RabbitMQ queue/channel setup
│── server.js          # MongoDB + MQ connection bootstrap
├── seed/
│   └── seeder.js                  # Adds dummy users and posts to DB
├── websockets/                    # WebSocket Server for Real-Time Delivery
│   ├── wsServer.js                # Handles AUTH + ACK from client
├── .env                           # Environment Configurations
├── server.js                      # WebSocket Entrypoint (can be renamed if needed)
```

---

## Install & Run Locally

### Prerequisites
- Node.js 18+
- Redis (cloud)
- RabbitMQ (AMQP Cloud instance)
- MongoDB (Atlas)

### Environment Setup

```bash
PORT=3000
MONGO_URI=<your-mongo-uri>
RABBITMQ_URL=<your-cloud-amqp-url>
QUEUE_NAME=notification.event
REDIS_URL=<your-redis-url>
```

### Install Dependencies
```bash
npm install
```

### Running the Services
In four terminals or Railway services, run:

1. Producer - Sends events to MQ
```bash
node producer/server.js
```

2. Consumer - Listens to MQ, buffers into Redis
```bash
node consumer/index.js
```

3. WebSocket Server - Delivers to online users
```bash
node server.js
```

4. Worker - Writes delivered messages to MongoDB
```bash
node jobs/worker.js
```

## API Endpoints (Producer)

### Simulate Like Event
```bash
POST <api-endpoint>/like
```

### Body
```json
{
  "actorId": "user1",
  "targetId": "user2",
  "postId": "post1",
  "type": "LIKE"
}
```

### Get Posts for UI
```bash
GET <api-endpoint>/posts
```

## WebSocket Protocol

### Client -> Server
- Authenticate: 
```json
{ "type": "AUTH", "userId": "mongo-user-id" }
```

- Acknowledge Notification: 
```json
{ "type": "ACK", "notificationId": "notif123" }
```

### Seeding Dummy Data

## Run: 
```bash
node seed/seeder.js
```
## Creates: 
- 2 Users: user1, user2
- Posts linked to users

## Deployment
Each service is deployed separately on Railway.app:

1. Producer API
2. Consumer Worker
3. WebSocket Notification Server
4. Async DB Worker

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Future Enhacements: 
 - Retry Queues (DLQ)
 - Fail-Fast Mechanism
 - Per-user Throttling Configs
 - GDPR Delete Compliance
 - Actor Abuse Prevention
 - Notification Preferences

