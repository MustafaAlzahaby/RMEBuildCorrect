# Rowad Field Guide — engineering handoff

## Product and terminology

Rowad Field Guide is an internal construction reference library for Rowad site teams. Employees use it to find procedures by CSI division and specification section, then open a guide containing the instructions and supporting media for a job. The repository and frontend package use the name Skill Craft Desk. The backend package is named rowad-academy-api. The UI calls a record a guide, while the API, MongoDB model, and routes call it a lesson. Treat these as the same entity.

The application provides a reference library and recent viewing history. The current implementation has no draft/review/publish state machine, course completion workflow, or attachment-text indexing. The CIO brief in Second project.md provides product rationale and historical troubleshooting. Use the source code and package manifests for current behavior. For example, a favicon and client-side guide search now exist, and both local and S3 storage are implemented.

## User workflows and frontend entry points

Routes are declared explicitly in frontend/src/main.tsx. Files under routes are page components.

| URL | Access | Behavior |
| --- | --- | --- |
| / | Public | Product landing page and entry to the app |
| /register | Guest | Submit name, work email, and password. The API sends or logs a verification link. |
| /verify-email | Public | Read the token from the link and call the verification endpoint |
| /login | Guest | Sign in with a verified, active work account |
| /library | Signed in | Browse division, section, and guide listings. Search matches guide text and category metadata. |
| /lessons/:id | Signed in | Open a guide and record a view. The route parameter can resolve through the API by slug or MongoDB ID. |
| /dashboard | Signed in | Review recently viewed guides |
| /admin | Admin | Manage guides, categories and users. Guide editing includes section selection, text fields and media uploads. |

Guide content is grouped into Video, Gallery, PDF, Instructions, Best Practices, Method Statement, ITP (inspection test plan), and Lesson Learnt. Search in frontend/src/lib/guide-search.ts checks title, description, the written guide fields, and metadata for the selected section and parent division. It searches data already available to the client.

## Architecture and code map

Two independent Node packages run together. The frontend is a React 19 and TypeScript SPA using Vite 8, React Router 7, Tailwind CSS 4 and Radix-based UI components. The backend is a CommonJS Express 4 API using Mongoose 8 and MongoDB. The browser calls Express with credentials included. Express handles database access, verification mail and media storage.

| Path | Responsibility |
| --- | --- |
| frontend/src/main.tsx | BrowserRouter, route guards, app layout, error boundary |
| frontend/src/context/AuthContext.tsx | Session bootstrap and shared auth state |
| frontend/src/components/ProtectedRoute.tsx | Client-side guest, employee and admin navigation guards |
| frontend/src/api/ | Fetch client, domain-specific API wrappers, and response adapters |
| frontend/src/types/index.ts | Frontend shapes for domain records |
| frontend/src/lib/categories.ts and guide-search.ts | Category hierarchy helpers and search matching |
| frontend/src/components/GuideCategoryBrowser.tsx and GuideCategorySelect.tsx | Reusable hierarchy browsing and selection |
| frontend/src/components/admin/ | Guide listing and editor components |
| frontend/src/styles.css and components/ui/ | Theme and reusable UI primitives |
| backend/src/server.js and app.js | Database connection, server startup, Express middleware and mounts |
| backend/src/routes/ and controllers/ | HTTP methods, validators, authorization and request behavior |
| backend/src/models/ | MongoDB schemas, indexes and serialization |
| backend/src/services/emailService.js and s3Service.js | Email delivery and asset storage/URL resolution |
| backend/src/data/csiTaxonomy.js and backend/scripts/ | CSI reference data, seed commands and operator scripts |

When changing an API field, trace the model, controller serialization, frontend adapter, types and consuming component. Populated category and lesson references can arrive as objects. Frontend adapters handle the conversion into UI shapes. Use the shared fetch client for credential handling, multipart requests, validation errors and 204 responses.

## Records and business rules

- **User** stores normalized unique email, bcrypt password hash, role (user or admin), verification state, resend metadata and active status. Public registration creates a user. Only the exact rowad-rme.com domain is accepted. Verification links are signed and expiring, and reissuing a link invalidates earlier links. The default resend cooldown is 60 seconds.
- **Category** stores name, globally unique slug, CSI code, optional parent ID, description and thumbnail URL. Top-level records represent divisions and children represent specification sections, such as 03 30 00 Cast-in-Place Concrete. The application also has to accommodate older category records. The category controller returns guide counts and rolls direct child counts into parents. Deletion is blocked if a category still has guides or children.
- **Lesson** stores title, globally unique slug, required category ID, description, instructions, bestPractices, methodStatement, itp, lessonLearnt, videoUrl, images and pdfUrl. The editor organizes assignment around sections. The API checks that the category exists. Reads can use a slug or ID, while updates, deletes and progress writes use MongoDB IDs. The category filter accepts a slug or ID and matches the assigned category directly.
- **LessonProgress** stores one record per user and lesson, enforced by a compound unique index. Viewing upserts viewedAt. The dashboard endpoint fetches up to 12 recent records and retains compatibility with the older completedAt field. Lesson deletion also removes associated progress records.

Sessions use JWTs in an HTTP-only cookie. The frontend loads the session through GET /api/auth/me. A 401 there is expected for a signed-out visitor. Browser route guards control navigation, while backend auth and role middleware enforce access. User administration includes changing role or active status and a separate delete operation.

## API map

All groups below are mounted under /api. GET /health is outside that prefix and reports process liveness.

| Group | Methods and paths | Access |
| --- | --- | --- |
| /auth | POST /register, POST /login, POST /logout, GET /verify-email?token=..., POST /resend-verification, GET /me | Session and verification entry points |
| /categories | GET /, GET /:slug | Signed in |
| /categories | POST /, PUT /:id, DELETE /:id | Admin |
| /lessons | GET / with optional category query, GET /:slug | Signed in |
| /lessons | POST /, PUT /:id, DELETE /:id | Admin |
| /progress | GET /, POST /:lessonId | Signed in, scoped to the current user |
| /users | GET /, PUT /:id, DELETE /:id | Admin |

Guide create and update support multipart fields video (one), pdf (one), and images (up to 20). Multer holds incoming files in memory. The controller applies supplied fields and uploads. A supplied image batch replaces the image list. Omitted files retain existing references during edits.

S3 mode persists object keys in the media fields and signs them on reads, with a default expiry of one hour. Treat signed URLs as temporary response values. Local mode writes files under backend/uploads and Express serves that folder at /uploads as static assets. Use a private S3 bucket when guide attachments need private storage.

## Local setup and configuration

Use a Node release supported by the installed Vite 8 version and a reachable MongoDB instance. Install dependencies independently in each package with npm ci when using the checked-in lockfiles. From backend, copy .env.example to .env if a local file does not already exist. Use backend/src/config/env.js as the reference for required values and defaults.

| Setting | Purpose |
| --- | --- |
| MONGODB_URI | MongoDB connection string |
| FRONTEND_ORIGIN | Exact browser origin allowed by CORS, normally http://localhost:8080 locally |
| API_BASE_URL | Backend public base URL used to generate local media links, normally http://localhost:5000 locally |
| PORT | API port, default 5000 |
| JWT_SECRET, EMAIL_VERIFICATION_SECRET | Separate signing secrets for session and verification tokens |
| EMAIL_FROM, EMAIL_DELIVERY | Sender value is required. Use log for local development or smtp for mail delivery. |
| SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS | SMTP connection settings. Use npm run check-email in backend to check delivery configuration. |
| FILE_STORAGE | Set local for disk storage or s3 for S3. The code default is s3. |
| AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY | S3 configuration. Check backend/src/config/s3.js for credential handling. |
| VITE_API_BASE_URL | Optional frontend override. Default is http://localhost:5000/api. Include the /api prefix when overriding it. |

Start npm run dev in backend and frontend in separate terminals. Visit http://localhost:8080 and confirm http://localhost:5000/health responds. If the UI loads and API calls fail, check the backend process, MongoDB reachability, frontend API URL and configured origin. Use consistent hostnames for browser sessions. When deploying the SPA, configure the host to serve index.html for client-side routes such as /verify-email and /lessons/example.

From backend, use npm run create-admin with ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap an admin. Use a valid work email and keep the password out of the handoff. Run npm run seed-categories to populate CSI categories. npm run seed-library-demo populates demo library data. Review the scripts and confirm the target database before running any command that writes records. Share the repository and environment templates with the receiving AI. Keep live environment files and credentials out of the handoff.

## Checks when changing behavior

- Frontend commands include npm run build and npm run lint. Backend npm run check checks the server entry point syntax. Neither package declares a test script.
- For an end-to-end smoke test, use a development database and log mail mode. Register with an eligible address, follow the logged verification link, sign in and open the library. Check that a regular account cannot reach admin actions.
- As an admin, create a guide in a section, upload representative media, edit a text field, and verify that the guide opens with its existing media. Browse the division and section and confirm the guide appears in search.
- Open the same guide again and verify it appears once in recent history. If changing auth, also exercise sign-out, an unverified account and an inactive account.
- Confirm live database contents, hosting, mail delivery and S3 configuration with the project owner before making claims about deployment. This handoff describes repository behavior.
