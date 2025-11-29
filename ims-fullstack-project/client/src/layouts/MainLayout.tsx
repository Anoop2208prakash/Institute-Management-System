// client/src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  // Global Layout State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-layout">
      
      {/* 1. Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

      {/* 2. Main Content Area */}
      <main className="main-content">
        
        {/* A. Navbar Component */}
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* B. Page Content (Router Outlet) */}
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;