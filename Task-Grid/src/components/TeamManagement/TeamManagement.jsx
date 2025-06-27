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
          setTeamMembers((prev) =>
            prev.map((member) =>
              member._id === editingId ? response.data : member
            )
          );

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
    <div className="team-management-container">
      <nav className="team-management-navbar">
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
            <div className="team-management-nav">
              <Link className="team-management-nav-link" to="/dashboard">Dashboard</Link>
              <Link className="team-management-nav-link" to="/projects">Manage Projects</Link>
              <Link className="team-management-nav-link active" to="/team">Manage Team</Link>
            </div>
            <button className="team-management-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right team-management-icon"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="team-management-main">
        <div className="team-management-content">
          <h2 className="team-management-title">Manage Team Members</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="team-management-card">
            <div className="team-management-card-body">
              <h5 className="team-management-card-title">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h5>
              <form onSubmit={handleSubmit}>
                <div className="team-management-form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="team-management-form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="team-management-form-group">
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
                <div className="team-management-form-group">
                  <label className="form-label">{editingId ? 'New Password (Optional)' : 'Password'}</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingId}
                  />
                </div>
                <button type="submit" className="team-management-button">
                  <i className="bi bi-save team-management-icon"></i>{editingId ? 'Update Member' : 'Add Member'}
                </button>
                {editingId && (
                  <button type="button" className="team-management-cancel" onClick={resetForm}>
                    <i className="bi bi-x-circle team-management-icon"></i>Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
          <h3 className="team-management-subtitle">All Team Members</h3>
          {teamMembers.length === 0 && !error && (
            <div className="alert alert-info">No team members available.</div>
          )}
          {teamMembers.length > 0 && (
            <div className="team-management-card">
              <div className="team-management-card-body">
                <div className="team-management-table-responsive">
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
                              className="btn btn-outline-warning team-management-action"
                              onClick={() => handleEdit(member)}
                            >EDIT
                            </button>
                            <button
                              className="btn btn-outline-danger team-management-action"
                              onClick={() => handleDelete(member._id)}
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

export default TeamManagement;