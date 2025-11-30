// client/src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserPlus, FaList, FaIdCard, FaUserCircle } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  role: string; // Receive Role
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, role }) => {
  
  const allMenuItems = [
    // COMMON
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['all'] },
    { path: '/profile', label: 'My Profile', icon: <FaUserCircle />, roles: ['all'] },
    { path: '/id-card', label: 'ID Card', icon: <FaIdCard />, roles: ['all'] },

    // ADMINISTRATOR ONLY
    { path: '/new-admission', label: 'New Admission', icon: <FaUserPlus />, roles: ['administrator'] },
    { path: '/view-admission', label: 'View Admission', icon: <FaList />, roles: ['administrator'] },
    
    // SUPER ADMIN ONLY
    { path: '/staff', label: 'Manage Staff', icon: <FaUserPlus />, roles: ['super_admin'] },
    { path: '/roles', label: 'Manage Roles', icon: <FaUserPlus />, roles: ['super_admin'] },
  ];

  // Filter Logic
  const filteredMenu = allMenuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(role)
  );

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      {/* ... toggle & logo ... */}
      <nav>
          {filteredMenu.map((item) => (
              <NavLink key={item.path} to={item.path} className="nav-item">
                  {item.icon}
                  <span>{item.label}</span>
              </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;