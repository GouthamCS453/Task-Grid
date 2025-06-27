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
        setError('Failed to load tasks.');
      });
  }, [user.name]);

  const taskSummary = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'Done').length,
  };

  return (
    <div className="team-dashboard-container">
     <nav className="team-dashboard-navbar">
  <div className="navbar-container">
    <Link className="navbar-brand fw-bold" to="/dashboard">Task Grid</Link>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="navbar-collapse" id="navbarNav">
      <div className="team-dashboard-nav">
        <Link className="team-dashboard-nav-link" to="/tasks">Manage Tasks</Link>
      </div>
      <button className="team-dashboard-logout" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right team-dashboard-icon"></i>Logout
      </button>
    </div>
  </div>
</nav>

      <main className="team-dashboard-main">
        <div className="team-dashboard-content">
          <h2 className="team-dashboard-title">Welcome, {user?.name} (Team Member)</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="team-dashboard-card">
            <div className="team-dashboard-card-body">
              <h5 className="team-dashboard-card-title">Your Task Summary</h5>
              <div className="team-dashboard-row">
                <div className="team-dashboard-column">Total Tasks: {taskSummary.total}</div>
                <div className="team-dashboard-column">Completed: {taskSummary.completed}</div>
              </div>
            </div>
          </div>
          <h3 className="team-dashboard-subtitle">Your Tasks</h3>
          {tasks.length === 0 && !error && (
            <div className="alert alert-info">No tasks assigned to you.</div>
          )}
          {tasks.length > 0 && (
            <div className="team-dashboard-card">
              <div className="team-dashboard-card-body">
                <div className="team-dashboard-table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Project</th>
                        <th scope="col">Status</th>
                        <th scope="col">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task._id}>
                          <td>{task.title}</td>
                          <td>{task.project?.title || 'N/A'}</td>
                          <td>
                            <span className={`badge bg-${task.status === 'Done' ? 'success' : task.status === 'In Progress' ? 'warning' : 'secondary'}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeamDashboard;