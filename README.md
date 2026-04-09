# JMI Quiz

An online quiz platform for JMI and AMU entrance exam preparation. Practice with previous year questions, take timed mock tests, and track your performance.

**Live:** [jmiquiz.live](https://jmiquiz.live)

## What it does

- Browse and attempt quizzes based on subject, year, and education level
- Timed quiz mode with negative marking (just like the real exam)
- Instant results with detailed question-by-question analysis
- Performance tracking — see your accuracy and improvement over time
- Dedicated JMI PYQ and AMU PYQ practice pages
- Admin panel for managing quizzes and questions

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 · Vite · Tailwind CSS · Framer Motion |
| Backend | Express 5 · Prisma ORM · PostgreSQL |
| Auth | JWT (access + refresh tokens) · bcrypt |
| Storage | Cloudinary (images) |
| Email | Brevo (transactional emails) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Set up the database and start:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

## Project Structure

```
├── backend/
│   ├── controllers/     # Route handlers
│   ├── routes/          # API route definitions
│   ├── middleware/       # Auth & error handling
│   ├── prisma/          # Database schema
│   └── utils/           # Helpers (email, cloudinary, etc.)
│
├── frontend/
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & Theme providers
│   │   ├── hooks/       # Custom hooks (SEO, etc.)
│   │   └── utils/       # API client & helpers
│   └── public/          # Static assets, sitemap
```

## Authors

- **Ayaz Nazir**
- **Mohd Hammad Qadir**
- **Ayaan Ahmad Siddiqui**
