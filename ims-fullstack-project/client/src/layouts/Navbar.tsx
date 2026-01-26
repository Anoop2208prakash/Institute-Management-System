// client/src/layouts/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { FaMoon, FaSun, FaUser, FaSignOutAlt, FaBell, FaSearch, FaBars } from 'react-icons/fa';
import LinearProgress from '@mui/material/LinearProgress'; 
import './Navbar.scss'; 

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  isLoading: boolean;
  toggleSidebar: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, isLoading, toggleSidebar }) => {
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
          const data = await res.json();
          setUser(data);
        }
      } catch (error) { console.error(error); }
    };
    fetchProfile();
  }, []);

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

  const getPageTitle = (pathname: string) => {
      if (pathname === '/' || pathname.includes('/dashboard')) return 'Dashboard';
      const cleanPath = pathname.split('/').pop()?.replace(/-/g, ' ');
      return cleanPath ? cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1) : 'Home';
  };

  const currentTitle = getPageTitle(location.pathname);

  /**
   * FIXED: avatarUrl logic for Cloudinary integration.
   * If user.avatar exists, it is used directly as it contains the full Cloudinary URL.
   * Removed prepending 'http://localhost:5000' which was causing broken links.
   */
  const avatarUrl = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <header className="navbar">
      
      {/* Left Actions */}
      <div className="navbar-left" style={{display:'flex', alignItems:'center', gap:'10px'}}>
        <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar}>
            <FaBars />
        </button>
        <div>
            <span className="breadcrumb">IMS &gt; {currentTitle}</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="navbar-center">
        <div className="global-search">
            <FaSearch />
            <input placeholder="Search..." />
        </div>
      </div>

      {/* Right Actions */}
      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title="Switch Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        <button className="icon-btn has-notification" title="Notifications">
            <FaBell />
        </button>

        <div className="divider"></div>

        <div className="profile-menu" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            {/* FIXED: Uses direct Cloudinary URL from the state */}
            <img 
              src={avatarUrl} 
              alt="Profile" 
              onError={(e) => {
                // Fallback for broken links
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;
              }}
            />
          </div>

          <div className={`dropdown-content ${isProfileOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
                <p>{user?.name || 'User'}</p>
                <span>{user?.email}</span>
            </div>
            <div className="menu-item" onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}>
              <FaUser /> My Profile
            </div>
            <div className="menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt /> Sign Out
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loader-container">
            <LinearProgress sx={{ height: 2, backgroundColor: 'transparent', '& .MuiLinearProgress-bar': { backgroundColor: 'var(--primary-color)' } }} />
        </div>
      )}
    </header>
  );
};

export default Navbar;