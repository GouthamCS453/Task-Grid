import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamDashboard.css';

function TeamDashboard({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks', { params: { assignedTo: user.name } })
      .then((response) => {
        setTasks(response.data);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      });
  }, [user.name]);

  const taskSummary = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'Done').length,
  };

  return (
    <div className="team-dashboard-container">
      <nav className="navbar navbar-expand-sm navbar-blue fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Task Manager</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/tasks">Manage Tasks</Link>
              </li>
            </ul>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>
      <div className="team-dashboard-content">
        <h2>Welcome, {user.name} (Team Member)</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Your Task Summary</h5>
            <p>Total Tasks: {taskSummary.total}</p>
            <p>Completed: {taskSummary.completed}</p>
          </div>
        </div>
        <h3>Your Tasks</h3>
        {tasks.length === 0 && !error ? (
          <p>No tasks assigned to you.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.project?.title || 'N/A'}</td>
                  <td>{task.status}</td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TeamDashboard;