# SkillBridge – Campus Skill Exchange Platform

**SkillBridge** is a MERN-stack web application that allows students to teach skills they know and learn new skills from other students within their campus community.

The platform encourages collaborative learning through a skill exchange and credit-based system.

## Project Overview

Students can create skill listings, explore available skills, request learning sessions, and earn or spend credits when sessions are completed.

## Features

- Student registration and login
- Secure password hashing and JWT authentication
- Student dashboard
- Create and explore teaching and learning skills
- Send and manage skill requests
- Accept, reject, and complete requests
- Skill credit transfer after completed sessions
- View and edit student profiles
- MongoDB database integration

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| API Communication | Axios |
| Version Control | Git and GitHub |

## Project Structure

```text
SkillBridge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/OrchidCoder/-SkillBridge.git
cd -SkillBridge
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure your own values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Skill Credit System

SkillBridge uses a credit-based exchange model:

1. A student creates a teaching skill.
2. Another student requests a learning session.
3. The skill owner accepts the request.
4. After the session is completed, credits are transferred from the learner to the teacher.

This encourages students to contribute their knowledge and participate in collaborative learning.

## Future Enhancements

- Profile photo upload
- Real-time messaging
- Session scheduling and notifications
- Student ratings and reviews
- Advanced skill recommendations
- Online deployment

## Author

**OrchidCoder**

GitHub: https://github.com/OrchidCoder

## License

This project is currently available as a public repository for educational and learning purposes.
