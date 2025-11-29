// client/src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUserCircle, 
  FaIdCard, // <--- Imported New Icon
  FaHistory, 
  FaUserPlus, 
  FaIdBadge, 
  FaUsers, 
  FaLayerGroup, 
  FaLock, 
  FaCode, 
  FaServer, 
  FaShieldAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaMoon, 
  FaSun, 
  FaSignOutAlt, 
  FaUser 
} from 'react-icons/fa';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => navigate('/login');

  // Sidebar Menu Configuration
  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: <FaHome /> },
    { path: '/profile', label: 'Profile', icon: <FaUserCircle /> },
    
    // --- NEW ITEM ADDED HERE ---
    { path: '/id-card', label: 'ID Card', icon: <FaIdCard /> }, 
    // ---------------------------

    { path: '/login-history', label: 'Login History', icon: <FaHistory /> },
    { path: '/staff-register', label: 'Sign Up', icon: <FaUserPlus /> },
    { path: '/roles', label: 'Role', icon: <FaIdBadge /> },
    { path: '/groups', label: 'Group', icon: <FaUsers /> },
    { path: '/user-groups', label: 'User Group', icon: <FaLayerGroup /> },
    { path: '/permissions', label: 'Permission', icon: <FaLock /> },
    { path: '/frontend', label: 'Frontend Application', icon: <FaCode /> },
    { path: '/backend', label: 'Backend Application', icon: <FaServer /> },
    { path: '/security', label: 'Security', icon: <FaShieldAlt /> },
  ];

  return (
    <div className="app-layout">
      
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        
        {/* Toggle Button */}
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </div>

        {/* Logo */}
        <div className="sidebar-logo">
           {isSidebarOpen ? <h2>IMS Pro</h2> : <h2>IP</h2>}
        </div>

        {/* Navigation List */}
        <nav>
            {menuItems.map((item) => (
                <NavLink 
                    key={item.label}
                    to={item.path} 
                    className="nav-item" 
                    title={!isSidebarOpen ? item.label : ''}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="main-content">
        
        <header className="navbar">
          <div className="navbar-left">
            {/* Breadcrumbs or Title could go here */}
          </div>

          <div className="navbar-right">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>

            <div className="profile-menu">
              <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <img src="https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff" alt="Profile" />
              </div>

              <div className={`dropdown-content ${isProfileOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                    <p>Super Admin</p>
                    <span>admin@ims.com</span>
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
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99 }} onClick={() => setIsProfileOpen(false)} />
            )}
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;