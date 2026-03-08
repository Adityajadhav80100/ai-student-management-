AI-Powered Smart Student Management & Performance Intelligence System
Overview

A modern, AI-driven MERN stack platform for managing students, predicting performance, detecting dropout risk, analyzing attendance, and recommending interventions.

Designed as a Computer Engineering mini-project with a clean, production-ready architecture.

🌐 Live Deployment
Frontend (Live Application)
https://ai-student-management-cg1.vercel.app
Backend API
https://ai-student-management-dnz1.onrender.com
Database

MongoDB Atlas (Cloud Database)

🔑 Demo Login Credentials
Admin

Email

admin@ai-school.com

Password

AdminPass123
Teacher

Email

priya@ai-school.com

Password

TeacherPass123
Student

Email

meera@ai-school.com

Password

StudentPass123
🚀 Features

JWT authentication (Student / Teacher / Admin roles)

Student CRUD management

Attendance tracking

Marks management

Performance prediction analytics

Dropout risk detection

Attendance trend analysis

AI-based recommendations

Role-based dashboards

Secure REST API backend

🧠 AI Analytics

The system includes a modular AI engine that provides:

Student performance prediction

Dropout risk detection

Attendance trend analysis

Recommendation engine for improvement strategies

🛠 Tech Stack
Frontend

React.js (Vite)

Tailwind CSS

React Router

Axios

Recharts

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

REST API

AI / Analytics

Rule-based prediction engine

Modular analytics architecture

Dev Tools

ESLint

Prettier

dotenv

⚙️ Setup Steps (Local Development)
1 Clone the repository
git clone https://github.com/your-username/ai-student-management.git
2 Install dependencies

Backend

cd backend
npm install

Frontend

cd frontend
npm install
3 Configure environment variables

Create .env files based on .env.example.

4 Start MongoDB

Run MongoDB locally or use MongoDB Atlas.

5 Seed the database
npm run seed
6 Start backend
npm run dev
7 Start frontend
npm run dev
📂 Folder Structure
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
📸 Screenshots

Add screenshots of:

Login Page

Admin Dashboard

Student Dashboard

Analytics Dashboard

🧑‍💻 Author

Aditya Jadhav
Computer Engineering

📜 License

MIT License
