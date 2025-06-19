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
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/projects')
      .then((response) => {
        const validProjects = response.data.filter(
          (project) => project && project._id && project.title
        );
        if (validProjects.length !== response.data.length) {
          console.warn(
            `Filtered out ${response.data.length - validProjects.length} invalid projects`
          );
        }
        setProjects(validProjects);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects.');
      });

    axios.get('http://localhost:5000/api/teammembers')
      .then((response) => {
        setTeamMembers(response.data);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
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
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks.');
      });
  }, [filterProject, filterMember]);

  const taskSummary = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'Done').length,
    pending: tasks.length - tasks.filter((task) => task.status === 'Done').length,
  };

  return (
    <div className="admin-dashboard-container">
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
              {user.role === 'Admin' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/projects">Manage Projects</Link>
                </li>
              )}
            </ul>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>
      <div className="admin-dashboard-content">
        <h2>Welcome, {user.name} (Admin)</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Task Summary</h5>
            <p>Total Tasks: {taskSummary.total}</p>
            <p>Completed: {taskSummary.completed}</p>
            <p>Tasks In Progress: {taskSummary.pending}</p>
          </div>
        </div>
        <div className="mb-3">
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
        <div className="mb-3">
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
        <h3>All Tasks</h3>
        {tasks.length === 0 && !error ? (
          <p>No tasks available.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project?.title || 'N/A'}</td>
                    <td>{task.assignedTo?.name || 'N/A'}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;