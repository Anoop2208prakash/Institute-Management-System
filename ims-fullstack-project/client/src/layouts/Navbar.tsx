// client/src/layouts/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaUser, FaSignOutAlt } from 'react-icons/fa';
import LinearProgress from '@mui/material/LinearProgress'; // Import MUI loader

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  isLoading: boolean; // <--- NEW PROP
}

interface UserProfile {
  name: string;
  email: string;
  roleDisplay: string;
  avatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, isLoading }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to load navbar profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const avatarUrl = user?.avatar 
    ? `http://localhost:5000${user.avatar}` 
    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <header className="navbar" style={{ position: 'relative' }}> 
      {/* Added relative positioning for the loader */}
      
      <div className="navbar-left">
        {/* Breadcrumbs or Title */}
      </div>

      <div className="navbar-right">
        <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        <div className="profile-menu">
          <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img src={avatarUrl} alt="Profile" />
          </div>

          <div className={`dropdown-content ${isProfileOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
                <p>{user?.name || 'Loading...'}</p>
                <span>{user?.email || ''}</span>
            </div>
            
            <div className="menu-item" onClick={() => navigate('/profile')}>
              <FaUser /> My Profile
            </div>
            
            <div className="menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </div>
          </div>
        </div>
        
        {isProfileOpen && (
            <div 
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99 }} 
              onClick={() => setIsProfileOpen(false)} 
            />
        )}
      </div>

      {/* --- GLOBAL LOADER --- */}
      {isLoading && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
            <LinearProgress 
                sx={{ 
                    height: 2, // Ultra thin
                    backgroundColor: 'transparent',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: 'var(--primary-color)' 
                    }
                }} 
            />
        </div>
      )}
    </header>
  );
};

export default Navbar;