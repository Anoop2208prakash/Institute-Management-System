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
  const [isHostelResident, setIsHostelResident] = useState<boolean>(false); // NEW: Residential status

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

  // Fetch Role & Residential Status
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch basic profile to get role
        const profileRes = await fetch('http://localhost:5000/api/profile/me', { headers });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserRole(profileData.role);

          // If user is a student, verify if they are assigned to a hostel
          if (profileData.role === 'student') {
            const hostelRes = await fetch('http://localhost:5000/api/hostel/my-allocation', { headers });
            setIsHostelResident(hostelRes.ok); // ok is true (200) if assignment exists
          }
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    fetchUserData();
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
          isHostelResident={isHostelResident} // NEW: Pass status to Sidebar
        />
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          isLoading={isLoading}
          toggleSidebar={toggleSidebar}
        />

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;