// client/src/layouts/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMoon, FaSun, FaUser, FaSignOutAlt, FaSearch, FaBell, FaCog } from 'react-icons/fa';
import LinearProgress from '@mui/material/LinearProgress'; 
import './Navbar.scss'; 

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  isLoading: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, isLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await res.json());
        }
      } catch (error) { console.error(error); }
    };
    fetchProfile();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get Page Title from URL
  const getPageTitle = () => {
      const path = location.pathname.split('/')[1];
      if (!path) return 'Dashboard';
      return path.replace('-', ' ').toUpperCase();
  };

  const avatarUrl = user?.avatar 
    ? `http://localhost:5000${user.avatar}` 
    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <header className="navbar">
      
      {/* Left: Breadcrumb / Title */}
      <div className="navbar-left">
         <span className="breadcrumb">{getPageTitle()}</span>
      </div>

      <div className="navbar-right">
        
        {/* Search Bar (Visual Only for now) */}
        <div className="search-box">
            <FaSearch />
            <input placeholder="Search..." />
        </div>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {/* Settings/Notification Icons */}
        <button className="icon-btn"><FaBell /></button>
        <button className="icon-btn"><FaCog /></button>

        {/* Profile */}
        <div className="profile-menu" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img src={avatarUrl} alt="Profile" />
          </div>

          <div className={`dropdown-content ${isProfileOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
                <p>{user?.name || 'User'}</p>
                <span>{user?.email}</span>
            </div>
            
            <div className="menu-item" onClick={() => navigate('/profile')}>
              <FaUser /> My Profile
            </div>
            <div className="menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </div>
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="loader-container">
            <LinearProgress sx={{ height: 2, backgroundColor: 'transparent', '& .MuiLinearProgress-bar': { backgroundColor: 'var(--primary-color)' } }} />
        </div>
      )}
    </header>
  );
};

export default Navbar;