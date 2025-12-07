// client/src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaUserCircle, FaIdCard, FaUsers, FaUserPlus, 
  FaChalkboardTeacher, FaLayerGroup, FaBook, FaCalendarAlt,
  FaBoxOpen, FaShoppingCart, FaBullhorn, FaClipboardList,
  FaChevronLeft, FaChevronRight, FaIdBadge, FaCheckSquare, FaPenNib 
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
    { path: '/announcements', label: 'Announcements', icon: <FaBullhorn />, roles: ['all'] },

    // --- TEACHER MODULES ---
    { path: '/teacher-subjects', label: 'My Subjects', icon: <FaChalkboardTeacher />, roles: ['teacher', 'super_admin'] },
    { path: '/attendance', label: 'Attendance', icon: <FaCheckSquare />, roles: ['teacher', 'super_admin'] },
    { path: '/enter-marks', label: 'Enter Marks', icon: <FaPenNib />, roles: ['teacher', 'super_admin'] },
    { path: '/library-catalog', label: 'Library', icon: <FaBook />, roles: ['teacher', 'student'] },

    // --- ADMISSION MODULES (Updated) ---
    // Only 'admission' and 'super_admin' can see these
    { path: '/new-admission', label: 'New Admission', icon: <FaUserPlus />, roles: ['administrator', 'super_admin'] },
    { path: '/view-admission', label: 'View Admission', icon: <FaUsers />, roles: ['administrator', 'super_admin'] },
    
    // --- ADMIN MODULES (General Management) ---
    { path: '/staff', label: 'Manage Staff', icon: <FaChalkboardTeacher />, roles: ['admin', 'super_admin'] },
    { path: '/programs', label: 'Manage Programs', icon: <FaLayerGroup />, roles: ['admin', 'super_admin'] },
    { path: '/semesters', label: 'Manage Semester', icon: <FaCalendarAlt />, roles: ['admin', 'super_admin'] },
    { path: '/subjects', label: 'Manage Subject', icon: <FaBook />, roles: ['admin', 'super_admin'] },
    { path: '/exams', label: 'Manage Exam', icon: <FaClipboardList />, roles: ['admin', 'super_admin'] },
    { path: '/inventory', label: 'Manage Inventory', icon: <FaBoxOpen />, roles: ['admin', 'super_admin'] },
    { path: '/orders', label: 'View Orders', icon: <FaShoppingCart />, roles: ['admin', 'super_admin'] },

    // --- LIBRARIAN ---
    { path: '/books', label: 'Manage Books', icon: <FaBook />, roles: ['librarian', 'super_admin'] },
    { path: '/loans', label: 'Manage Loans', icon: <FaClipboardList />, roles: ['librarian', 'super_admin'] },
    
    // --- SUPER ADMIN ---
    { path: '/roles', label: 'Manage Roles', icon: <FaIdBadge />, roles: ['super_admin'] },

    // --- STUDENT MODULES ---
    { path: '/my-subjects', label: 'My Subjects', icon: <FaBook />, roles: ['student'] },
    { path: '/my-attendance', label: 'My Attendance', icon: <FaCheckSquare />, roles: ['student'] },
    { path: '/my-results', label: 'My Results', icon: <FaPenNib />, roles: ['student'] },
    { path: '/my-invoices', label: 'My Invoices', icon: <FaClipboardList />, roles: ['student'] },
    { path: '/admit-card', label: 'Admit Card', icon: <FaIdCard />, roles: ['student'] },
    { path: '/stationery', label: 'Stationery Store', icon: <FaBoxOpen />, roles: ['student', 'teacher'] },
    { path: '/my-orders', label: 'My Orders', icon: <FaShoppingCart />, roles: ['student', 'teacher'] },
    // { path: '/library-catalog', label: 'Library', icon: <FaBook />, roles: ['student', 'teacher'] },
  ];

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