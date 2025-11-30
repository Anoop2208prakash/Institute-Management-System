// client/src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [userRole, setUserRole] = useState<string>('');
  
  // Navigation Hooks
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch Role on Mount
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
      } catch (error) {
        console.error("Failed to load user role", error);
      }
    };
    fetchRole();
  }, []);

  // --- FIXED LOADING LOGIC ---
  useEffect(() => {
    // Check if router is busy
    const isNavigating = navigation.state === 'loading' || navigation.state === 'submitting';

    if (isNavigating) {
      // FIX: Wrap in setTimeout(..., 0) to avoid "Synchronous Update" warning
      const startTimer = setTimeout(() => {
        setIsLoading(true);
      }, 0);
      return () => clearTimeout(startTimer);
    } else {
      // Trigger visually for page transitions even if data is cached
      const startTimer = setTimeout(() => setIsLoading(true), 0);
      
      // Turn off after a brief delay for smoothness
      const endTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [navigation.state, location.pathname]);

  return (
    <div className="app-layout">
      
      {/* 1. Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar} 
        role={userRole} 
      />

      {/* 2. Main Content */}
      <main className="main-content">
        
        {/* Navbar with Loader */}
        <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isLoading={isLoading} 
        />

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;