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

  // Redirect to login if user is null
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // FETCH EVERYTHING
  const fetchTasks = () => {
    const query = user.role === 'Team Member' ? { assignedTo: user.name } : {};
    axios.get('http://localhost:5000/api/tasks', { params: query })
      .then((response) => {
        const validTasks = response.data.filter(
          (task) => task && task._id && task.title
        );
        console.log('Fetched tasks:', validTasks);
        setTasks(validTasks);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error.response || error.message);
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

    axios.get('http://localhost:5000/api/teammembers')
      .then((response) => {
        const validMembers = response.data.filter(
          (member) => member && member._id && member.name
        );
        setTeamMembers(validMembers);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching team members:', error.response || error.message);
        setError('Failed to load team members.');
      });

    fetchTasks();
  }, [user]);

  // SUBMISSION
  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { ...form };
    if (form.comments && form.comments.trim()) {
      taskData.comments = [{ text: form.comments.trim(), createdAt: new Date() }];
    } else {
      delete taskData.comments;
    }
    console.log('Sending taskData:', taskData);
    setError('');
    setSuccess('');

    if (editingId) {
      const url = `http://localhost:5000/api/tasks/:id`.replace(':id', editingId);
      axios.put(url, taskData)
        .then((response) => {
          console.log('Update task response:', { status: response.status, data: response.data });
          if (response.status === 200 && response.data) {
            fetchTasks(); 
            resetForm();
            setSuccess('Task updated successfully!');
          } else {
            console.error('Unexpected response:', response);
            fetchTasks();
          }
        })
        .catch((error) => {
          console.error('Error updating task:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          setError(`Failed to update task: ${error.response?.data?.message || error.message}`);
        });
    } else {
      axios.post('http://localhost:5000/api/tasks', taskData)
        .then((response) => {
          console.log('Create task response:', { status: response.status, data: response.data });
          if (response.status === 201 && response.data) {
            fetchTasks(); // Refetch to ensure consistency
            resetForm();
            setSuccess('Task created successfully!');
          } else {
            console.error('Unexpected response:', response);
            setError('Task created, but response is invalid.');
            fetchTasks();
          }
        })
        .catch((error) => {
          console.error('Error creating task:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          setError(`Failed to create task: ${error.response?.data?.message || error.message}`);
        });
    }
  };


  const handleDelete = (id) => {
    setError('');
    setSuccess('');
    const url = `http://localhost:5000/api/tasks/:id`.replace(':id', id);
    axios.delete(url)
      .then((response) => {
        console.log('Delete task response:', { status: response.status });
        setTasks(tasks.filter((t) => t._id !== id));
        setSuccess('Task deleted successfully!');
      })
      .catch((error) => {
        console.error('Error deleting task:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };


  if (!user) return null;

  return (
    <div className="task-management-container">
      <nav className="navbar navbar-expand-sm navbar-blue fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Task Grid</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/tasks">Manage Tasks</Link>
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
      <div className="task-management-content">
        <h2>Manage Tasks</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {(user.role === 'Admin' || (user.role === 'Team Member' && editingId)) && (
          <form onSubmit={handleSubmit} className="mb-3">
            {user.role === 'Admin' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-control"
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  />
                </div>
              </>
            )}
            {user.role === 'Team Member' && (
              <div className="mb-3">
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
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Task' : 'Add Task'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary ms-2" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        )}
        <h3>{user.role === 'Admin' ? 'All Tasks' : 'Your Tasks'}</h3>
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
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={`${task._id}-${task.updatedAt}`}>
                    <td>{task.title}</td>
                    <td>{task.project?.title || 'N/A'}</td>
                    <td>{task.assignedTo?.name || 'N/A'}</td>
                    <td>{task.status}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      {user.role === 'Admin' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
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
  );
}

export default TaskManagement;