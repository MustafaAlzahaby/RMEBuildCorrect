# Skill Craft Desk

This repository is split into two independent Node.js packages:

- `frontend/` - React SPA built with Vite and React Router.
- `backend/` - Express REST API with MongoDB, JWT auth, email verification, and S3 uploads.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:8080` by default.

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Fill in the backend `.env` values before starting the API.
