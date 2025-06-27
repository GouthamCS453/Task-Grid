import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setUser }) {
  const [role, setRole] = useState('Team Member');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/login', {
        name,
        role,
        password,
      });
      setUser({ name: data.name, role: data.role });
      setError('');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-card">
          <div className="login-card-body">
            <h2 className="login-title">Welcome Back</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="login-form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="login-form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="login-form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary login-button">
                <i className="bi bi-box-arrow-in-right login-button-icon"></i>Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;