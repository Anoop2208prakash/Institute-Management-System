// client/src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaIdCard, 
  FaChevronLeft, 
  FaChevronRight, 
  FaIdBadge,
  FaUsers // <--- Imported for Manage Staff
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  
  // Sidebar Menu Configuration
  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: <FaHome /> },
    { path: '/id-card', label: 'ID Card', icon: <FaIdCard /> },
    
    // --- NEW ITEM ---
    { path: '/staff', label: 'Manage Staff', icon: <FaUsers /> },
    // ----------------
    
    { path: '/roles', label: 'Role', icon: <FaIdBadge /> },
  ];

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <div className="sidebar-toggle" onClick={toggle}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </div>

      {/* Logo */}
      <div className="sidebar-logo">
         {isOpen ? <h2>IMS Pro</h2> : <h2>IP</h2>}
      </div>

      {/* Navigation List */}
      <nav>
          {menuItems.map((item) => (
              <NavLink 
                  key={item.label}
                  to={item.path} 
                  className="nav-item" 
                  title={!isOpen ? item.label : ''}
              >
                  {item.icon}
                  <span>{item.label}</span>
              </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;