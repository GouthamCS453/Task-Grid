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
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/dashboard">Task Grid</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/tasks">Manage Tasks</Link>
              </li>
            </ul>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-5 mt-5">
        <div className="container-fluid py-4">
          <h2 className="mb-4">Welcome, {user?.name} (Team Member)</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Your Task Summary</h5>
              <div className="row">
                <div className="col-md-6 mb-2">Total Tasks: {taskSummary.total}</div>
                <div className="col-md-6 mb-2">Completed: {taskSummary.completed}</div>
              </div>
            </div>
          </div>
          <h3 className="mb-3">Your Tasks</h3>
          {tasks.length === 0 && !error && (
            <div className="alert alert-info">No tasks assigned to you.</div>
          )}
          {tasks.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
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