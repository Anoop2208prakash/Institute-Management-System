// client/src/features/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext';
import './Login.scss';
import logo from '../../assets/image/logo.png'; 

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const [alertInfo, setAlertInfo] = useState<{
    show: boolean; 
    type: AlertColor; 
    msg: string;
  }>({ 
    show: false, type: 'error', msg: '' 
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!credentials.email) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
        login(data.token, data.user);
        setAlertInfo({ show: true, type: 'success', msg: 'Login successful! Redirecting...' });
        setTimeout(() => navigate('/dashboard'), 800); 
      } else {
        setAlertInfo({ 
            show: true, 
            type: 'error', 
            msg: data.message || 'Invalid email or password.' 
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setAlertInfo({ 
          show: true, type: 'error', msg: 'Unable to connect to server.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <FeedbackAlert 
        isOpen={alertInfo.show} type={alertInfo.type} 
        message={alertInfo.msg} onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />

      {/* LEFT: Brand Section (Hidden on Mobile) */}
      <div className="login-banner">
        <div className="banner-content">
          <img src={logo} alt="IMS Logo" />
          <h1>Institute Management<br/>System Pro</h1>
          <p>
            The centralized platform for students, teachers, and admins. 
            Manage your academic journey with ease.
          </p>
          
          <div className="feature-pill">
            <FaCheckCircle style={{color: '#ffd700'}} /> 
            <span>v2.0 Now Live</span>
            &nbsp; with Online Exams
          </div>
        </div>
      </div>

      {/* RIGHT: Form Section */}
      <div className="login-form-container">
        <div className="login-box">
          
          {/* --- MOBILE ONLY HEADER --- */}
          <div className="mobile-brand">
             <img src={logo} alt="IMS" />
             <h2>IMS Pro</h2>
          </div>

          <div className="header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope />
                <input 
                  type="email" name="email" 
                  className={errors.email ? 'error' : ''}
                  value={credentials.email} onChange={handleChange} 
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className={errors.password ? 'error' : ''}
                  value={credentials.password} onChange={handleChange} 
                  placeholder="••••••••"
                />
                <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            <div className="actions">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign In <FaArrowRight /></>}
            </button>
          </form>

          <div className="footer">
            <p>Don't have an account? <Link to="/staff-register">Staff Registration</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;