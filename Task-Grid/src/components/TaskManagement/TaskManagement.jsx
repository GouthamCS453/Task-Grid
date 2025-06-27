import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TaskManagement.css';

function TaskManagement({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    project: '',
    status: 'To Do',
    comments: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchTasks = () => {
    const query = user.role === 'Team Member' ? { assignedTo: user.name } : {};
    axios.get('http://localhost:5000/api/tasks', { params: query })
      .then((response) => {
        const validTasks = response.data.filter(
          (task) => task && task._id && task.title
        );
        setTasks(validTasks);
        setError('');
      })
      .catch((error) => {
        setError('Failed to load tasks.');
      });
  };

  useEffect(() => {
    if (!user) return;
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

    axios.get('http://localhost:5000/api/teammembers')
      .then((response) => {
        const validMembers = response.data.filter(
          (member) => member && member._id && member.name
        );
        setTeamMembers(validMembers);
        setError('');
      })
      .catch((error) => {
        setError('Failed to load team members.');
      });

    fetchTasks();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let taskData;
    if (user.role === 'Team Member' && editingId) {
      taskData = { status: form.status };
    } else {
      taskData = { ...form };
      if (form.comments && form.comments.trim()) {
        taskData.comments = [{ text: form.comments.trim(), createdAt: new Date() }];
      } else {
        delete taskData.comments;
      }
    }

    if (editingId) {
      axios.put(`http://localhost:5000/api/tasks/${editingId}`, taskData)
        .then((response) => {
          if (response.status === 200 && response.data) {
            fetchTasks();
            resetForm();
            setSuccess('Task updated successfully!');
          }
        })
        .catch((error) => {
          setError(`Failed to update task: ${error.response?.data?.message || error.message}`);
        });
    } else {
      axios.post('http://localhost:5000/api/tasks', taskData)
        .then((response) => {
          if (response.status === 201 && response.data) {
            fetchTasks();
            resetForm();
            setSuccess('Task created successfully!');
          }
        })
        .catch((error) => {
          setError(`Failed to create task: ${error.response?.data?.message || error.message}`);
        });
    }
  };

  const handleDelete = (id) => {
    setError('');
    setSuccess('');
    axios.delete(`http://localhost:5000/api/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((t) => t._id !== id));
        setSuccess('Task deleted successfully!');
      })
      .catch((error) => {
        setError(`Failed to delete task: ${error.response?.data?.message || error.message}`);
      });
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
      project: task.project?._id || '',
      status: task.status || 'To Do',
      comments: task.comments?.length > 0 ? task.comments[0].text : '',
    });
    setEditingId(task._id);
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      project: '',
      status: 'To Do',
      comments: '',
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="task-management-container">
      <nav className="task-management-navbar">
        <div className="navbar-container">
          <Link className="navbar-brand fw-bold" to="/dashboard">📋Task Grid</Link>
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
            <div className="task-management-nav">
              <Link className="task-management-nav-link" to="/dashboard">Dashboard</Link>
              <Link className="task-management-nav-link active" to="/tasks">Manage Tasks</Link>
              {user.role === 'Admin' && (
                <Link className="task-management-nav-link" to="/projects">Manage Projects</Link>
              )}
            </div>
            <button className="task-management-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right task-management-icon"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="task-management-main">
        <div className="task-management-content">
          <h2 className="task-management-title">Manage Tasks</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {(user.role === 'Admin' || (user.role === 'Team Member' && editingId)) && (
            <div className="task-management-card">
              <div className="task-management-card-body">
                <h5 className="task-management-card-title">{editingId ? 'Edit Task' : 'Add Task'}</h5>
                <form onSubmit={handleSubmit}>
                  {user.role === 'Admin' && (
                    <>
                      <div className="task-management-form-group">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Due Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.dueDate}
                          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Assigned To</label>
                        <select
                          className="form-select"
                          value={form.assignedTo}
                          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                          required
                        >
                          <option value="">Select Team Member</option>
                          {teamMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Project</label>
                        <select
                          className="form-select"
                          value={form.project}
                          onChange={(e) => setForm({ ...form, project: e.target.value })}
                          required
                        >
                          <option value="">Select Project</option>
                          {projects.map((project) => (
                            <option key={project._id} value={project._id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          required
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <div className="task-management-form-group">
                        <label className="form-label">Comments</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.comments}
                          onChange={(e) => setForm({ ...form, comments: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  {user.role === 'Team Member' && (
                    <div className="task-management-form-group">
                      <label className="form-label">Update Status</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        required
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary task-management-button">
                    <i className="bi bi-save task-management-icon"></i>{editingId ? 'Update Task' : 'Add Task'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary task-management-cancel" onClick={resetForm}>
                      <i className="bi bi-x-circle task-management-icon"></i>Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
          <div className="task-management-card">
            <div className="task-management-card-body">
              <h3 className="task-management-card-title">{user.role === 'Admin' ? 'All Tasks' : 'Your Tasks'}</h3>
              {tasks.length === 0 && !error && (
                <div className="alert alert-info">No tasks available.</div>
              )}
              {tasks.length > 0 && (
                <div className="task-management-table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Project</th>
                        <th scope="col">Assigned To</th>
                        <th scope="col">Status</th>
                        <th scope="col">Due Date</th>
                        <th scope="col">Actions</th>
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
                          <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-outline-warning task-management-action"
                              onClick={() => handleEdit(task)}
                            >EDIT
                            </button>
                            {user.role === 'Admin' && (
                              <button
                                className="btn btn-outline-danger task-management-action"
                                onClick={() => handleDelete(task._id)}
                              >DELETE
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaskManagement;