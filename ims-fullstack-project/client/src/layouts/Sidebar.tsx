// client/src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaUserCircle, FaIdCard, FaUsers, 
  FaChalkboardTeacher, FaLayerGroup, FaBook, FaCalendarAlt,
  FaBoxOpen, FaShoppingCart, FaBullhorn, FaClipboardList,
  FaChevronLeft, FaChevronRight, FaIdBadge,
  FaCheckSquare,
  FaPenNib,
  FaBookReader
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, role }) => {
  
  const menuItems = [
    // --- COMMON ---
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['all'] },
    { path: '/profile', label: 'My Profile', icon: <FaUserCircle />, roles: ['all'] },
    { path: '/id-card', label: 'ID Card', icon: <FaIdCard />, roles: ['all'] },

    // --- ADMIN MODULES ---
    // Students & Staff
    { path: '/view-admission', label: 'View Admission', icon: <FaUsers />, roles: ['admin', 'super_admin'] },
    { path: '/staff', label: 'Manage Staff', icon: <FaChalkboardTeacher />, roles: ['admin', 'super_admin'] },
    
    // Academic Management
    { path: '/programs', label: 'Manage Programs', icon: <FaLayerGroup />, roles: ['admin', 'super_admin'] },
    { path: '/semesters', label: 'Manage Semester', icon: <FaCalendarAlt />, roles: ['admin', 'super_admin'] },
    { path: '/subjects', label: 'Manage Subject', icon: <FaBook />, roles: ['admin', 'super_admin'] },
    { path: '/exams', label: 'Manage Exam', icon: <FaClipboardList />, roles: ['admin', 'super_admin'] },

    // Inventory
    { path: '/inventory', label: 'Manage Inventory', icon: <FaBoxOpen />, roles: ['admin', 'super_admin'] },
    { path: '/orders', label: 'View Orders', icon: <FaShoppingCart />, roles: ['admin', 'super_admin'] },

    // Communication
    { path: '/announcements', label: 'Announcement', icon: <FaBullhorn />, roles: ['admin', 'super_admin', 'teacher'] },

    // --- SUPER ADMIN ONLY ---
    { path: '/roles', label: 'Manage Roles', icon: <FaIdBadge />, roles: ['super_admin'] },
    
    // --- LIBRARIAN ---
    { path: '/books', label: 'Manage Books', icon: <FaBook />, roles: ['librarian', 'super_admin'] },
    { path: '/loans', label: 'Manage Loans', icon: <FaClipboardList />, roles: ['librarian', 'super_admin'] },

    // --- TEACHER MODULES ---
    { path: '/my-class', label: 'My Class', icon: <FaUsers />, roles: ['teacher', 'super_admin'] },
    { path: '/attendance', label: 'Attendance', icon: <FaCheckSquare />, roles: ['teacher', 'super_admin'] },
    { path: '/enter-marks', label: 'Enter Marks', icon: <FaPenNib />, roles: ['teacher', 'super_admin'] },
    { path: '/library-catalog', label: 'Library', icon: <FaBook />, roles: ['teacher', 'student'] },
    { path: '/my-loans', label: 'My Loans', icon: <FaBookReader />, roles: ['teacher', 'student'] },
  ];

  // Filter Logic
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(role)
  );

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggle}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </div>

      <div className="sidebar-logo">
         {isOpen ? <h2>IMS Pro</h2> : <h2>IP</h2>}
      </div>

      <nav>
          {filteredMenu.map((item) => (
              <NavLink 
                  key={item.path} 
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