import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamManagement.css';

function TeamManagement({ user, setUser }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Team Member',
    password: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    axios.get('http://localhost:5000/api/teammembers')
      .then((response) => {
        const validMembers = response.data.filter(
          (member) => member && member._id && member.name
        );
        setTeamMembers(validMembers);
        setError('');
      })
      .catch((error) => {
        setError(`Failed to load team members: ${error.response?.data?.message || error.message}`);
      });
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const memberData = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password) {
      memberData.password = form.password;
    }

    if (editingId) {
      axios.put(`http://localhost:5000/api/teammembers/${editingId}`, memberData)
        .then((response) => {
          setTeamMembers(teamMembers.map((member) => (member._id === editingId ? response.data : member)));
          resetForm();
          setSuccess('Team member updated successfully!');
        })
        .catch((error) => {
          setError(`Failed to update team member: ${error.response?.data?.message || error.message}`);
        });
    } else {
      axios.post('http://localhost:5000/api/teammembers', memberData)
        .then((response) => {
          setTeamMembers([...teamMembers, response.data]);
          resetForm();
          setSuccess('Team member created successfully!');
        })
        .catch((error) => {
          setError(`Failed to create team member: ${error.response?.data?.message || error.message}`);
        });
    }
  };

  const handleDelete = (id) => {
    setError('');
    setSuccess('');
    axios.delete(`http://localhost:5000/api/teammembers/${id}`)
      .then(() => {
        setTeamMembers(teamMembers.filter((member) => member._id !== id));
        setSuccess('Team member deleted successfully!');
      })
      .catch((error) => {
        setError(`Failed to delete team member: ${error.response?.data?.message || error.message}`);
      });
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'Team Member',
      password: '',
    });
    setEditingId(member._id);
    setSuccess('');
    setError('');
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: 'Team Member',
      password: '',
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    navigate('/login');
    setUser(null);
  };

  if (!user || user.role !== 'Admin') return null;

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
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/projects">Manage Projects</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/team">Manage Team</Link>
              </li>
            </ul>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-5 mt-5">
        <div className="container-fluid py-4">
          <h2 className="mb-3">Manage Team Members</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                  >
                    <option value="Team Member">Team Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{editingId ? 'New Password (Optional)' : 'Password'}</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingId}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>{editingId ? 'Update Member' : 'Add Member'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-secondary ms-2" onClick={resetForm}>
                    <i className="bi bi-x-circle me-1"></i>Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
          <h3 className="mb-3">All Team Members</h3>
          {teamMembers.length === 0 && !error && (
            <div className="alert alert-info">No team members available.</div>
          )}
          {teamMembers.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member._id}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>{member.role}</td>
                          <td>
                            <button
                              className="btn btn-outline-warning me-2"
                              onClick={() => handleEdit(member)}
                            >EDIT
                              {/* <i className="bi bi-pencil"></i> */}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(member._id)}
                            >DELETE
                              {/* <i className="bi bi-trash"></i> */}
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

export default TeamManagement;