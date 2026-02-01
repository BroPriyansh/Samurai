# Activity Feed & Real-Time Notifications System

A mini backend system similar to GitHub/LinkedIn activity feeds.  
Supports event ingestion, user feeds, real-time notifications, analytics, and performance testing.

---

## Features
- Event ingestion for user actions
- User feed with stable, cursor-based pagination
- Real-time notifications via Server-Sent Events (SSE)
- Polling fallback for notifications
- Time-windowed analytics
- Load-tested under concurrent traffic

---

## Tech Stack
- Node.js
- Express / Fastify
- In-memory / SQLite database
- Server-Sent Events (SSE)

---

## API Endpoints

### Event Ingestion



POST /events




### Feed



GET /feed?user_id=<id>&cursor=<optional>&limit=<optional>




### Real-Time Notifications



GET /notifications/stream?user_id=<id>




### Notification Polling



GET /notifications?user_id=<id>&since=<optional>




### Analytics



GET /top?window=1m | 5m | 1h




---

## Running Locally
```bash
npm install
npm run dev



Service runs on:



http://localhost:8080




Load Testing


Load testing was performed using autocannon via npx.


Example:



npx autocannon -c 200 -d 20 http://localhost:8080/feed?user_id=1



SSE endpoints were not load-tested using synthetic tools.
