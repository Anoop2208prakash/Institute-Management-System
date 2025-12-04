// client/src/features/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext'; // <--- 1. Import Auth Context
import './Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- 2. Destructure login function
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{
    show: boolean; 
    type: AlertColor; 
    msg: string;
  }>({ 
    show: false, 
    type: 'error', 
    msg: '' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(prev => ({ ...prev, show: false }));

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Use Context Login (Updates State + LocalStorage automatically)
        login(data.token, data.user);
        
        setAlertInfo({ show: true, type: 'success', msg: 'Login successful! Redirecting...' });
        
        setTimeout(() => navigate('/dashboard'), 500); 
      } else {
        setAlertInfo({ 
            show: true, 
            type: 'error', 
            msg: data.message || 'Login failed. Please check credentials.' 
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      
      setAlertInfo({ 
          show: true, 
          type: 'error', 
          msg: 'Network error. Is the backend server running?' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />

      <div className="login-card">
        <h2>Login</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <Link to="/staff-register" className="staff-reg-link">
            Staff Registration (Temporary)
        </Link>
      </div>
    </div>
  );
};

export default Login;