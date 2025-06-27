import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ user, setUser }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
    setUser(null);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    axios.get('http://localhost:5000/api/projects')
      .then((response) => {
        const validProjects = response.data.filter(
          (project) => project && project._id && project.title
        );
        setProjects(validProjects);
        setError('');
      })
      .catch(() => {
        setError('Failed to load projects.');
      });

    axios.get('http://localhost:5000/api/teammembers')
      .then((response) => {
        setTeamMembers(response.data);
        setError('');
      })
      .catch(() => {
        setError('Failed to load team members.');
      });

    const query = {};
    if (filterProject) query.project = filterProject;
    if (filterMember) query.assignedTo = filterMember;
    axios.get('http://localhost:5000/api/tasks', { params: query })
      .then((response) => {
        setTasks(response.data);
        setError('');
      })
      .catch(() => {
        setError('Failed to load tasks.');
      });
  }, [user, filterProject, filterMember, navigate]);

  if (!user) return null;

  const taskSummary = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'Done').length,
    pending: tasks.length - tasks.filter((task) => task.status === 'Done').length,
  };

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-dashboard-navbar">
  <div className="navbar-container">
    <Link className="navbar-brand fw-bold" to="/dashboard">
      Task Grid
    </Link>
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
      <div className="admin-dashboard-nav">
        <Link className="admin-dashboard-nav-link" to="/tasks">
          Manage Tasks
        </Link>
        {user.role === 'Admin' && (
          <>
            <Link className="admin-dashboard-nav-link" to="/projects">
              Manage Projects
            </Link>
            <Link className="admin-dashboard-nav-link" to="/team">
              Manage Team
            </Link>
          </>
        )}
      </div>
      <button
        className="admin-dashboard-logout"
        onClick={handleLogout}
      >
        <i className="bi bi-box-arrow-right admin-dashboard-icon"></i>
        Logout
      </button>
    </div>
  </div>
</nav>

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-content">
          <h2 className="admin-dashboard-title">Welcome, {user.name} (Admin)</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-body">
              <h5 className="admin-dashboard-card-title">Task Summary</h5>
              <div className="admin-dashboard-row">
                <div className="admin-dashboard-column">Total Tasks: {taskSummary.total}</div>
                <div className="admin-dashboard-column">Completed: {taskSummary.completed}</div>
                <div className="admin-dashboard-column">Tasks In Progress: {taskSummary.pending}</div>
              </div>
            </div>
          </div>
          <div className="admin-dashboard-row">
            <div className="admin-dashboard-filter-column">
              <label className="form-label">Filter by Project</label>
              <select
                className="form-select"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title || 'Untitled Project'}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-dashboard-filter-column">
              <label className="form-label">Filter by Team Member</label>
              <select
                className="form-select"
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="">All Members</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <h3 className="admin-dashboard-subtitle">All Tasks</h3>
          {tasks.length === 0 && !error && (
            <div className="alert alert-info">No tasks available.</div>
          )}
          {tasks.length > 0 && (
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-card-body">
                <div className="admin-dashboard-table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Project</th>
                        <th scope="col">Assigned To</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task._id}>
                          <td>{task.title}</td>
                          <td>{task.project?.title || 'N/A'}</td>
                          <td>{task.assignedTo?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge bg-${task.status === 'Done' ? 'success' : task.status === 'In Progress' ? 'warning' : 'secondary'}`}>
                              {task.status}
                            </span>
                          </td>
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

export default AdminDashboard;