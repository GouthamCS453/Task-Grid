import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectManagement.css';

// Component to manage projects with role-based access
function ProjectManagement({ user, setUser }) {
  const [projects, setProjects] = useState([]); // List of projects
  const [form, setForm] = useState({ // Form state for creating/editing
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState(null); // ID of project being edited
  const [error, setError] = useState(''); // Error message
  const [success, setSuccess] = useState(''); // Success message
  const navigate = useNavigate();

  // Redirect to login if user is null
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch projects on component mount or user change
  useEffect(() => {
    if (!user) return; // Prevent fetching if user is null
    fetchProjects();
  }, [user]);

  // Helper to fetch projects
  const fetchProjects = () => {
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
        console.error('Error fetching projects:', error.response || error.message);
        setError('Failed to load projects.');
      });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Submit form to create or update project
  const handleSubmit = (e) => {
    e.preventDefault();
    const baseUrl = 'http://localhost:5000/api/projects';
    const url = editingId ? `${baseUrl}/:id`.replace(':id', editingId) : baseUrl;
    const method = editingId ? axios.put : axios.post;

    console.log('Sending project data:', { url, data: form, editingId }); // Debug payload
    setError('');
    setSuccess('');

    method(url, form)
      .then((response) => {
        console.log('Project response:', { status: response.status, data: response.data });
        if (response.status === 200 && response.data) {
          // Refetch projects to ensure latest data
          fetchProjects();
          resetForm();
          setSuccess('Project updated successfully!');
        } else {
          console.error('Unexpected response:', response);
          setError('Project updated, but response is invalid. Projects refreshed.');
          fetchProjects();
        }
      })
      .catch((error) => {
        console.error(`Error ${editingId ? 'updating' : 'creating'} project:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(`Failed to ${editingId ? 'update' : 'create'} project: ${error.response?.data?.message || error.message}`);
      });
  };

  // Delete a project
  const handleDelete = (id) => {
    setError('');
    setSuccess('');
    const url = 'http://localhost:5000/api/projects/:id'.replace(':id', id);
    axios.delete(url)
      .then((response) => {
        console.log('Delete project response:', { status: response.status });
        setProjects(projects.filter((p) => p._id !== id));
        setSuccess('Project deleted successfully!');
      })
      .catch((error) => {
        console.error('Error deleting project:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(`Failed to delete project: ${error.response?.data?.message || error.message}`);
      });
  };

  // Load project data into form for editing
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

  // Reset form and editing state
  const resetForm = () => {
    setForm({ title: '', description: '', startDate: '', endDate: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  // Format date for display
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  // Render nothing if user is null (handled by useEffect redirect)
  if (!user) return null;

  return (
    <div className="project-management-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-sm navbar-blue fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Task Manager</Link>
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
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tasks">Manage Tasks</Link>
              </li>
              {user.role === 'Admin' && (
                <li className="nav-item">
                  <Link className="nav-link active" to="/projects">Manage Projects</Link>
                </li>
              )}
            </ul>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="project-management-content">
        <h2>Manage Projects</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Project Form (Admin Only) */}
        {user.role === 'Admin' && (
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="mb-3">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                value={form.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={form.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={form.endDate}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Project' : 'Add Project'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        )}

        {/* Project List */}
        <h3>Projects</h3>
        {projects.length === 0 && !error ? (
          <p>No projects available.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  {user.role === 'Admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={`${project._id}-${project.updatedAt}`}>
                    <td>{project.title}</td>
                    <td>{project.description || 'N/A'}</td>
                    <td>{formatDate(project.startDate)}</td>
                    <td>{formatDate(project.endDate)}</td>
                    {user.role === 'Admin' && (
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(project._id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
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

export default ProjectManagement;