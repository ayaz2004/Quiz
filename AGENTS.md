# JMI Quiz - AGENTS.md

## Quick Start

### Environment Setup

Create `.env` in `backend/`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

### Development Commands

Backend (Express + Prisma + PostgreSQL):
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy   # applies prisma/migrations to the database in DATABASE_URL
npm run dev  # Starts on port 3000, auto-generates Prisma client
```

Frontend (React 19 + Vite):
```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

## Architecture Notes

### Repo Structure
- **backend/**: Express server, Prisma ORM, route handlers
  - Entry: `index.js` (sets up CORS, middlewares, starts jobs)
  - Routes: all prefixed with `/api`
  - Jobs: `resultPoller.js`, `scholarshipExpiry.js` auto-start on server
- **frontend/**: React SPA, router via `react-router-dom`
  - Entry: `main.jsx` → `App.jsx`
  - Auth: `AuthContext.jsx` (JWT-based)
  - Pages: organized by feature

### Key Execution Flow
1. Backend `index.js` loads env, sets up Express with CORS, mounts all routes, auto-starts jobs
2. Frontend `App.jsx` renders MainLayout or AuthLayout based on auth context
3. Quizzes flow: Browse (quiz-browser components) → Take (TakeQuiz.jsx) → Results (QuizResult.jsx)
4. Result polling: backend job checks attempts periodically for status updates

### Database Schema
PostgreSQL with Prisma (see `backend/prisma/schema.prisma`):
- Main entities: User, Quiz, Question, QuizAttempt, Purchase, Scholarship
- `Quiz.cutoffs`: Contains exam cutoffs per year by category
- `Quiz.hasNegativeMarking` and `Quiz.negativeMarks`: Controls scoring rules per quiz

## Critical Conventions

### CORS Origins (backend/index.js:14-22)
Hardcoded allowed origins. Don't add new frontend domains without updating `allowedOrigins` array.

### Express 5 (backend/package.json:26)
Using Express 5, note breaking changes vs Express 4 if adding middleware.

### JWT Authentication
- One `Session` row per signed-in device (max 5 per user), holding its access and session token
- `User.accessToken` / `User.sessionToken` still hold the newest sign-in; requests matching only these are accepted and migrated to a `Session`
- `POST /api/users/refresh` rotates the access token of one session; sign-out ends one session
- Auth middlewares verify tokens and attach user to `req.user` (and `req.session`)

### Prisma Client Generation
Always run `npx prisma generate` after schema changes before `npm run dev`. Schema changes need a migration folder in `backend/prisma/migrations`; production runs `prisma migrate deploy` on `npm start`.

### Quiz Time Limit
Time limit stored in `Quiz.timeLimit` (minutes). Quiz player calculates remaining time in frontend (QuizTimer.jsx).

### Negative Marking
Configured per quiz (`Quiz.hasNegativeMarking` + `Quiz.negativeMarks`). Player applies penalty in frontend scoring.

### Scholarship Status
Backend `scholarshipExpiry.js` job automatically un-publishes scholarships past their deadline (Scholarship.deadline).

### Image Uploads
Backend uses Cloudinary (config in `.env`). Multer middleware handles file uploads for quiz images.

## API Structure

All backend routes prefixed with `/api` (backend/index.js:65):
- `/api/users` - Auth, profile
- `/api/quiz` - Quiz listing, taking, attempts
- `/api/scholarships` - Scholarship CRUD
- `/api/admin` - Admin operations (quiz management, access grants)
- `/api/qa` - Question bank management
- `/api/result-track` - Course results tracking
- `/api/suggestions` - User suggestions
- `/api/jmi-result` - JMI result portal lookup
- Mobile app: `/api/courses`, `/api/topics`, `/api/practice` (questions with answers, response sync, review queue), `/api/study-profile`, `/api/bookmarks`, `/api/devices` (FCM tokens), `/api/app/home`
- Topic tagging: `/api/admin/topics`, `/api/admin/topic-review`; suggestions come from `npm run suggest-topics` (dry run unless `--apply`)

## Environment Variables

Backend must have: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `FRONTEND_URL`
Frontend must have: `VITE_API_URL`

Optional for phone push: `FIREBASE_SERVICE_ACCOUNT_JSON` (service-account JSON, raw or base64) or `GOOGLE_APPLICATION_CREDENTIALS`. Without them FCM is skipped.

Backend uses `.env` for secrets. Frontend uses `.env` but values are exposed at build time.

## No CI/CD, Tests, or Linters

- No GitHub Actions workflows
- No test files (backend test script just echoes error)
- No ESLint/Prettier config
- No pre-commit hooks
- Backend uses nodemon for dev server auto-restart

## Database Interactions

Prisma client imported from `@prisma/client` (backend/config/env.js loads). Schema in `backend/prisma/schema.prisma`, migrations in `backend/prisma/migrations`.

## Common Operations

### Add new quiz route
1. Create handler in `backend/controllers/`
2. Add route in `backend/routes/quiz.route.js`
3. Export route from `backend/routes/index.js` if needed
4. No need to modify `backend/index.js` (routes mounted at `/api`)

### Add new frontend page
1. Create `.jsx` in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx` (MainLayout routes for authenticated, AuthLayout for public)
3. Import components from `frontend/src/components/` or create new component file

### Update database schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <change>` against a local database (creates the migration folder and regenerates the client)
3. Commit the migration folder; production applies it with `prisma migrate deploy`
4. Backend restart required for Prisma client changes