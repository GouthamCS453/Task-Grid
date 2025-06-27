import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectManagement.css';

function ProjectManagement({ user, setUser }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchProjects = () => {
    axios.get('http://localhost:5000/api/projects')
      .then((response) => {
        const validProjects = response.data.filter(
          (project) => project && project._id && project.title
        );
        setProjects(validProjects);
        setError('');
      })
      .catch((error) => {
        setError('Failed to load projects.');
      });
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchProjects();
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (editingId) {
      axios.put(`http://localhost:5000/api/projects/${editingId}`, form)
        .then(() => {
          fetchProjects();
          resetForm();
          setSuccess('Project updated successfully!');
        })
        .catch((error) => {
          setError(`Failed to update project: ${error.response?.data?.message || error.message}`);
        });
    } else {
      axios.post('http://localhost:5000/api/projects', form)
        .then(() => {
          fetchProjects();
          resetForm();
          setSuccess('Project created successfully!');
        })
        .catch((error) => {
          setError(`Failed to create project: ${error.response?.data?.message || error.message}`);
        });
    }
  };

  const handleDelete = (id) => {
    setError('');
    setSuccess('');
    axios.delete(`http://localhost:5000/api/projects/${id}`)
      .then(() => {
        setProjects(projects.filter((p) => p._id !== id));
        setSuccess('Project deleted successfully!');
      })
      .catch((error) => {
        setError(`Failed to delete project: ${error.response?.data?.message || error.message}`);
      });
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title || '',
      description: project.description || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
    });
    setEditingId(project._id);
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  if (!user || user.role !== 'Admin') return null;

  return (
    <div className="project-management-container">
      <nav className="project-management-navbar">
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
            <div className="project-management-nav">
              <Link className="project-management-nav-link" to="/dashboard">Dashboard</Link>
              <Link className="project-management-nav-link" to="/tasks">Manage Tasks</Link>
              <Link className="project-management-nav-link active" to="/projects">Manage Projects</Link>
            </div>
            <button className="project-management-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right project-management-icon"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="project-management-main">
        <div className="project-management-content">
          <h2 className="project-management-title">Manage Projects</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="project-management-card">
            <div className="project-management-card-body">
              <h5 className="project-management-card-title">{editingId ? 'Edit Project' : 'Add Project'}</h5>
              <form onSubmit={handleSubmit}>
                <div className="project-management-form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="project-management-form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="project-management-row">
                  <div className="project-management-column">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="project-management-column">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary project-management-button">
                  <i className="bi bi-save project-management-icon"></i>{editingId ? 'Update Project' : 'Add Project'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-secondary project-management-cancel" onClick={resetForm}>
                    <i className="bi bi-x-circle project-management-icon"></i>Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
          <h3 className="project-management-subtitle">All Projects</h3>
          {projects.length === 0 && !error && (
            <div className="alert alert-info">No projects available.</div>
          )}
          {projects.length > 0 && (
            <div className="project-management-card">
              <div className="project-management-card-body">
                <div className="project-management-table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Description</th>
                        <th scope="col">Start Date</th>
                        <th scope="col">End Date</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id}>
                          <td>{project.title}</td>
                          <td>{project.description || 'N/A'}</td>
                          <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-warning project-management-action"
                              onClick={() => handleEdit(project)}
                            >EDIT
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger project-management-action"
                              onClick={() => handleDelete(project._id)}
                            >DELETE
                            </button>
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

export default ProjectManagement;