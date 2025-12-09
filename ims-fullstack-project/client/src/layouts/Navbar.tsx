// client/src/layouts/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { FaMoon, FaSun, FaUser, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';
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
  role?: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, isLoading }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // 1. Fetch User Data & Announcements
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        // Fetch Profile
        const profileRes = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) setUser(await profileRes.json());

        // Fetch Latest Announcements
        const noticesRes = await fetch('http://localhost:5000/api/announcements');
        if (noticesRes.ok) {
            const data = await noticesRes.json();
            // Take top 5 recent
            setAnnouncements(data.slice(0, 5));
        }

      } catch (error) { console.error(error); }
    };
    initData();
  }, []);

  // 2. Click Outside Listener (Handles both dropdowns)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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
      const cleanPath = pathname.split('/').pop()?.replace(/-/g, ' ');
      return cleanPath ? cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1) : 'Home';
  };

  const currentTitle = getPageTitle(location.pathname);
  const avatarUrl = user?.avatar ? `http://localhost:5000${user.avatar}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <header className="navbar">
      
      <div className="navbar-left">
        <span className="breadcrumb">IMS &gt; {currentTitle}</span>
      </div>

      <div className="navbar-center">
        <div className="global-search">
            <FaSearch />
            <input placeholder="Search..." />
        </div>
      </div>

      <div className="navbar-right">
        
        <button className="icon-btn" onClick={toggleTheme} title="Switch Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {/* --- NOTIFICATIONS DROPDOWN --- */}
        <div className="notification-wrapper" ref={notifRef}>
            <button 
                className={`icon-btn ${announcements.length > 0 ? 'has-notification' : ''}`} 
                title="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
                <FaBell />
            </button>
            
            <div className={`dropdown-content ${isNotifOpen ? 'open' : ''}`}>
                <div className="header">
                    Notifications 
                    <span onClick={() => navigate('/announcements')}>View All</span>
                </div>
                <div className="notif-list">
                    {announcements.length > 0 ? announcements.map(note => (
                        <div key={note.id} className="notif-item" onClick={() => navigate('/announcements')}>
                            <h4>{note.title}</h4>
                            <p>{note.content}</p>
                            <span className="time">{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                    )) : (
                        <div className="empty">No new announcements</div>
                    )}
                </div>
            </div>
        </div>

        {/* Removed Settings Button here */}

        <div className="divider"></div>

        {/* Profile Menu */}
        <div className="profile-menu" ref={profileRef}>
          <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img src={avatarUrl} alt="Profile" />
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