# Rowad Academy API

Node.js + Express REST API for the Rowad construction tutorial and academy platform.

## Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Fill in MongoDB, JWT, SMTP, frontend origin, and AWS S3 values in `.env`.

4. Start the API:

   ```bash
   npm run dev
   ```

The API runs on `PORT` and exposes routes under `/api`.

## Notes

- Auth uses JWTs stored in HTTP-only cookies.
- Registration and login reject emails outside `@rowad-rme.com` at the controller level.
- Lesson uploads use Multer memory storage and stream files to a private S3 bucket.
- Lesson asset fields store S3 object keys in MongoDB. API reads return fresh one-hour pre-signed URLs for video, images, and PDFs.
- CORS allows only `FRONTEND_ORIGIN` and includes credentials for cookie auth.
