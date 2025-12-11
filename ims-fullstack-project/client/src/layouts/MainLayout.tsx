// client/src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  // 1. Initialize State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [userRole, setUserRole] = useState<string>('');
  
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // 2. Handle Screen Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Auto-Close Sidebar on Route Change (Mobile Only)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch Role
  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role); 
        }
      } catch (error) { console.error("Failed to load user role", error); }
    };
    fetchRole();
  }, []);

  // Loading Logic
  useEffect(() => {
    const isNavigating = navigation.state === 'loading' || navigation.state === 'submitting';
    if (isNavigating) {
      const startTimer = setTimeout(() => setIsLoading(true), 0);
      return () => clearTimeout(startTimer);
    } else {
      const startTimer = setTimeout(() => setIsLoading(true), 0);
      const endTimer = setTimeout(() => setIsLoading(false), 500);
      return () => { clearTimeout(startTimer); clearTimeout(endTimer); };
    }
  }, [navigation.state, location.pathname]);

  return (
    <div className={`app-layout ${isMobile ? 'mobile-view' : ''}`}>
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggle={toggleSidebar} 
            role={userRole} 
          />
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isLoading={isLoading} 
            toggleSidebar={toggleSidebar} // <--- Clean Prop Pass
        />

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;