# Habit Quest

A modern, gamified daily progress tracker with a React/Tailwind frontend and an Express/MongoDB API.

## Features

- Dashboard with today's completion, weekly rings, monthly average, XP, and level progress
- Habit creation, editing, deletion, streaks, daily checks, and completion percentages
- Daily tasks with per-day notes and completed vs pending status
- Gamification with XP, levels, streak rewards, and achievement badges
- Calendar heatmap, progress rings, and trend charts
- Dark mode, browser reminders, CSV export, and a lightweight auth UI
- Express API with MongoDB models for users, habits, tasks, and notes

## Structure

```text
client/src/
  components/     Reusable UI and feature components
  constants/      Shared tracker constants and empty/demo state factories
  hooks/          Frontend tracker/auth state orchestration
  pages/          Screen-level composition
  services/       API client
  utils/          Date and stats helpers
server/src/
  config/         MongoDB connection
  controllers/    Route handlers
  middleware/     Auth middleware
  models/         Mongoose models
  routes/         Express routers
  utils/          Token and serialization helpers
```

## Run Locally

```bash
npm install
npm run dev
```

The React app runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

If Vite starts a second frontend because `5173` is already busy, use the printed port such as `http://localhost:5174`.

For authentication and MongoDB persistence, make sure MongoDB is running. The API defaults to:

```text
mongodb://127.0.0.1:27017/habit_quest
```

You can override it by copying `server/.env.example` to `server/.env` and setting `MONGODB_URI` plus `JWT_SECRET`.

Guest mode shows demo data. After login/signup, tracker data is loaded only from MongoDB, so new users start empty.
