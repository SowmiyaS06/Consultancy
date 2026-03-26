# MERN Deployment Guide (Render)

This project is prepared for Render deployment with:
- Backend web service configuration via [render.yaml](render.yaml)
- Environment-variable-based API URL config for frontend
- Production-safe CORS and runtime env validation on backend

## 1. Backend Deployment (Render Web Service)

### Option A: Blueprint deploy (recommended)
1. Push this repository to GitHub.
2. In Render: New + -> Blueprint.
3. Select your repository.
4. Render auto-detects [render.yaml](render.yaml) and creates backend service.

### Option B: Manual deploy
1. In Render: New + -> Web Service.
2. Connect repository.
3. Set:
   - Root Directory: backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start

### Required backend environment variables
Set these in Render -> backend service -> Environment:
- NODE_ENV=production
- MONGODB_URI=<your mongodb atlas connection string>
- JWT_SECRET=<strong secret>
- JWT_EXPIRES_IN=1d
- CORS_ORIGIN=https://your-frontend.onrender.com

Optional:
- MONGODB_CONNECT_RETRIES=5
- MONGODB_RETRY_DELAY_MS=3000

Backend health check endpoint:
- https://your-backend.onrender.com/api/health

## 2. Frontend Deployment (Render Static Site)

1. In Render: New + -> Static Site.
2. Connect the same repository.
3. Configure:
   - Build Command: npm install && npm run build
   - Publish Directory: dist

Set frontend environment variable:
- VITE_API_BASE_URL=https://your-backend.onrender.com

After deploy, copy static site URL and update backend CORS_ORIGIN with this URL.

## 3. API Base URL Strategy

Frontend uses [src/lib/apiConfig.ts](src/lib/apiConfig.ts):
- Production: uses VITE_API_BASE_URL
- Local dev fallback: http://localhost:5000 (only in dev mode)

Files using shared base URL:
- [src/lib/storeApi.ts](src/lib/storeApi.ts)
- [src/lib/adminApi.ts](src/lib/adminApi.ts)
- [src/pages/admin/AdminLogin.tsx](src/pages/admin/AdminLogin.tsx)

## 4. Backend Production Improvements Included

- Server binds to process.env.PORT in [backend/src/server.js](backend/src/server.js)
- Runtime env validation in [backend/src/config/env.js](backend/src/config/env.js)
- MongoDB URI sourced from env vars in [backend/src/config/db.js](backend/src/config/db.js)
- Strict CORS allowlist in [backend/src/app.js](backend/src/app.js)
- Production-safe error payloads in [backend/src/middlewares/errorHandler.js](backend/src/middlewares/errorHandler.js)
- Example backend env includes CORS in [backend/.env.example](backend/.env.example)
- Example frontend prod env in [.env.production.example](.env.production.example)

## 5. Verify After Deployment

1. Backend URL responds at /api/health.
2. Frontend loads products/offers without CORS errors.
3. Auth and order APIs work from frontend domain.
4. No backend secrets are committed to repository.
