# Office Work Tracking System

A modern office work tracking system built with the MERN stack (MongoDB, Express.js, React, and Node.js).

## Features

- User Authentication (Login/Register)
- Task/Project Management
- Time Tracking
- Employee Management
- Reports and Analytics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd office-work-tracking-system
```

2. Install dependencies for both backend and frontend
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/office-tracker
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Running the Application

1. Start the development server (both frontend and backend):
```bash
npm run dev
```

2. To run only the backend:
```bash
npm run server
```

3. To run only the frontend:
```bash
npm run client
```

The backend server will run on http://localhost:5000
The frontend development server will run on http://localhost:3000

## API Documentation

(Documentation will be added as endpoints are developed)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 