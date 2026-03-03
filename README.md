# Acupunturista Master LMS

A comprehensive Learning Management System (LMS) for Acupunturista Master, built with NestJS (Backend) and Next.js (Frontend).

## Features

- **User Authentication**: JWT-based auth with login and registration.
- **Course Management**: Browse courses, view modules, and watch lessons.
- **Gamification**: Earn points and badges for completing lessons and community interaction.
- **Community**: Post questions, share insights, and comment on discussions.
- **Events**: View upcoming events and webinars.
- **Admin Panel**: Basic management for events (and future expansion).
- **Hotmart Integration**: Webhook support for enrollment management.

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, Redis
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (External)
- **Cache**: Redis (External)

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database URL
- Redis URL

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
   REDIS_URL="redis://host:port"
   JWT_SECRET="your-secret-key"
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run migrations (if needed) or push schema:
   ```bash
   npx prisma db push
   ```

6. Start the server:
   ```bash
   npm run start:dev
   ```
   The backend will run on `http://localhost:3000`.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3001` (or 3000 if backend is not running, but usually Next.js detects port).

## Usage

1. **Register**: Create a new account at `/register`.
2. **Login**: Access your dashboard at `/login`.
3. **Dashboard**: View your progress, badges, and upcoming events.
4. **Courses**: Navigate to `/dashboard/courses` to start learning.
5. **Community**: Join the discussion at `/dashboard/community`.

## API Documentation

The backend API endpoints are available at `http://localhost:3000`.
Key endpoints:
- `POST /auth/login`
- `POST /auth/register`
- `GET /courses`
- `GET /users/me`
- `POST /webhooks/hotmart`

## License

Private
