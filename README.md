# Task Grid

Task Grid is a modern web-based task management application built using React and Vite. It is designed to help users efficiently organize, track, and analyze their tasks through an intuitive and responsive interface. The application focuses on simplicity, performance, and visual clarity, making it suitable for both personal productivity and basic administrative monitoring.

This Project is built upon the MERN Stack and it is a simple task organisation platform.
---

## Features

### Task Management
- Create, update, and delete tasks
- Organize tasks in a structured manner
- Easily track progress and status

### Dashboard & Analytics
- Visual representation of task data
- Charts and graphs for better insights
- Overview of task distribution and activity

### User Interface
- Clean and responsive design using Bootstrap
- Smooth navigation with React Router
- Component-based architecture for scalability

### Performance
- Fast development and build times using Vite
- Optimized rendering with React

---
## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Bootstrap

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Utilities
- Axios

### Visualization
- Chart.js
- Recharts

---

## Project Structure

Task-Grid/
│
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and media files
│   ├── components/         # Reusable UI components
│   │   ├── AdminDashboard/
│   │   ├── HomePage/
│   │   └── ...
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Application entry point
│   └── styles/             # CSS and styling files
│
├── index.html              # Main HTML file
├── package.json            # Project dependencies
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation

---
## Installation and Setup

### 1. Clone the Repository
git clone https://github.com/your-username/task-grid.git  
cd task-grid  

### 2. Install Dependencies
npm install  

### 3. Run Development Server
npm run dev 
---

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service
3. Default connection URL:
   mongodb://127.0.0.1:27017/taskgrid

---

### Option 2: MongoDB Atlas (Cloud)

1. Create an account on MongoDB Atlas
2. Create a cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string:
   mongodb+srv://<username>:<password>@cluster-url/taskgrid

---
## Backend Setup (Node.js + Express)

1. Navigate to backend folder:
   cd backend

2. Install dependencies:
   npm install

3. Start the server:
   node server.js

   OR (if nodemon is installed):
   npx nodemon server.js

4. Server will run on:
   http://localhost:5000

---

 



