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
  
  // Role State (New)
  const [userRole, setUserRole] = useState<string>('');

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch User Role on Mount
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
          // data.role contains "super_admin", "admin", "student", etc.
          setUserRole(data.role); 
        }
      } catch (error) {
        console.error("Failed to load user role", error);
      }
    };

    fetchRole();
  }, []);

  return (
    <div className="app-layout">
      
      {/* 1. Sidebar Component (Now receives Role) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar} 
        role={userRole} 
      />

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