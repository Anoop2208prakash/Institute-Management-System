// client/src/layouts/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaUser, FaSignOutAlt } from 'react-icons/fa';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  roleDisplay: string;
  avatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Fetch User Profile to get Avatar & Name
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

  // Determine Avatar URL
  const avatarUrl = user?.avatar 
    ? `http://localhost:5000${user.avatar}` 
    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Optional: Breadcrumbs or Page Title */}
      </div>

      <div className="navbar-right">
        {/* Theme Toggle */}
        <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {/* Profile Dropdown */}
        <div className="profile-menu">
          <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img 
              src={avatarUrl} 
              alt="Profile" 
            />
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
        
        {/* Close dropdown when clicking outside */}
        {isProfileOpen && (
            <div 
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99 }} 
              onClick={() => setIsProfileOpen(false)} 
            />
        )}
      </div>
    </header>
  );
};

export default Navbar;