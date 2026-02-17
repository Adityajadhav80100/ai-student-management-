# AI-Powered Smart Student Management & Performance Intelligence System

## Overview
A modern, AI-driven MERN stack platform for managing students, predicting performance, detecting dropout risk, analyzing attendance, and recommending interventions. Designed for Computer Engineering mini-projects, with a professional, production-ready codebase.

## Features
- JWT authentication (Student/Teacher/Admin roles)
- Student CRUD management
- Attendance & marks modules
- AI analytics: performance prediction, dropout risk, attendance trends, recommendations
- Modern React dashboard (Vite, Tailwind, Recharts)
- RESTful API (Node.js, Express, MongoDB)
- Modular AI engine
- Role-based dashboards

## Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, REST API
- **AI/Analytics:** Rule-based logic, modular AI engine
- **Dev Tools:** ESLint, Prettier, dotenv

## Setup Steps
1. Clone the repo
2. Install backend & frontend dependencies
3. Configure `.env` files (see `.env.example`)
4. Run MongoDB locally
5. Seed the database (`npm run seed` in backend)
6. Start backend (`npm run dev` in backend)
7. Start frontend (`npm run dev` in frontend)

## Folder Structure
```
backend/
  ai-engine/
  controllers/
  models/
  routes/
  middleware/
  config/
  utils/
  seed/
frontend/
  src/components/
  src/pages/
  src/routes/
  src/utils/
  src/assets/
  src/context/
  src/services/
.github/
.env.example
```

## Screenshots
> _Add screenshots of dashboards and analytics here_

## License
MIT
