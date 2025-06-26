import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import TeamDashboard from './components/TeamDashboard/TeamDashboard';
import ProjectManagement from './components/ProjectManagement/ProjectManagement';
import TaskManagement from './components/TaskManagement/TaskManagement';
import TeamManagement from './components/TeamManagement/TeamManagement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              user?.role === 'Admin' ? (
                <AdminDashboard user={user} setUser={setUser} />
              ) : (
                <TeamDashboard user={user} setUser={setUser} />
              )
            }
          />
          <Route path="/projects" element={<ProjectManagement user={user} setUser={setUser} />} />
          <Route path="/tasks" element={<TaskManagement user={user}  setUser={setUser}/>} />
          <Route path="/team" element={<TeamManagement user={user} setUser={setUser} />} />
        </Routes>
      
      </div>
  );
}

export default App;