# Rowad Field Guide API

Node.js + Express REST API for the Rowad on-site field guide.

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

## Work-email verification

Registration accepts only exact `@rowad-rme.com` addresses. New accounts cannot sign in until
the employee opens the signed, expiring verification link sent to that mailbox.

For local development, `EMAIL_DELIVERY=log` prints the verification URL in the backend terminal.
For real delivery, configure the SMTP values in `.env` and set `EMAIL_DELIVERY=smtp`. Before
starting the application, verify the connection and credentials:

```bash
npm run check-email
```

The resend endpoint applies a per-account cooldown, and issuing a new link invalidates all older
verification links.

## Notes

- Auth uses JWTs stored in HTTP-only cookies.
- Registration and login reject emails outside `@rowad-rme.com` at the controller level.
- Lesson uploads use Multer memory storage and stream files to a private S3 bucket.
- Lesson asset fields store S3 object keys in MongoDB. API reads return fresh one-hour pre-signed URLs for video, images, and PDFs.
- CORS allows only `FRONTEND_ORIGIN` and includes credentials for cookie auth.

## Create the first admin

After `.env` is configured, run:

PowerShell:

```powershell
$env:ADMIN_NAME="Admin User"
$env:ADMIN_EMAIL="admin@rowad-rme.com"
$env:ADMIN_PASSWORD="change-me-strong"
npm run create-admin
```

macOS/Linux:

```bash
ADMIN_NAME="Admin User" ADMIN_EMAIL="admin@rowad-rme.com" ADMIN_PASSWORD="change-me-strong" npm run create-admin
```
