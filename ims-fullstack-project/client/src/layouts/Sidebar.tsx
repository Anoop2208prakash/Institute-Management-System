// client/src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaIdCard, FaUserPlus, FaUsers,
  FaChalkboardTeacher, FaLayerGroup, FaBook, FaCalendarAlt,
  FaBoxOpen, FaShoppingCart, FaBullhorn, FaClipboardList, FaIdBadge, FaCheckSquare, FaPenNib,
  FaEnvelopeOpenText, FaHotel, FaBed, FaUserShield, FaTicketAlt
} from 'react-icons/fa';
import './Sidebar.scss';
import logo from '../assets/image/banner-logo.png';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  hideIf?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  role: string;
  isHostelResident?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, role, isHostelResident = false }) => {

  const menuGroups: MenuGroup[] = [
    {
      title: "General",
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['all'] },
        { path: '/id-card', label: 'ID Card', icon: <FaIdCard />, roles: ['all'] },
        { path: '/announcements', label: 'Announcements', icon: <FaBullhorn />, roles: ['all'] },
      ]
    },
    {
      title: "Admission",
      items: [
        { path: '/new-admission', label: 'New Admission', icon: <FaUserPlus />, roles: ['administrator', 'super_admin', 'admin'] },
        { path: '/view-admission', label: 'View Admission', icon: <FaUsers />, roles: ['administrator', 'super_admin', 'admin'] },
        { path: '/inquiries', label: 'Inquiries (Leads)', icon: <FaEnvelopeOpenText />, roles: ['administrator', 'super_admin', 'admin'] },
      ]
    },
    {
      title: "Academic Management",
      items: [
        { path: '/programs', label: 'Programs', icon: <FaLayerGroup />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/semesters', label: 'Semesters', icon: <FaCalendarAlt />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/subjects', label: 'Subjects', icon: <FaBook />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/exams', label: 'Exams', icon: <FaClipboardList />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/staff', label: 'Staff', icon: <FaChalkboardTeacher />, roles: ['admin', 'super_admin', 'administrator'] },
      ]
    },
    {
      title: "Hostel & Residence",
      items: [
        // --- WARDEN / ADMIN ITEMS ---
        { path: '/hostel-management', label: 'Manage Hostel', icon: <FaHotel />, roles: ['super_admin', 'admin', 'warden'] },
        { path: '/room-allocation', label: 'Room Allocation', icon: <FaBed />, roles: ['super_admin', 'admin', 'warden'] },
        { path: '/view-students', label: 'Hostel Students', icon: <FaUsers />, roles: ['super_admin', 'admin', 'warden'] },
        { 
          path: '/manage-gatepasses', // UPDATED: Points to the Admin Dashboard
          label: 'Manage Gatepasses', 
          icon: <FaUserShield />, 
          roles: ['super_admin', 'admin', 'warden'] 
        },
        { path: '/view-complaints', label: 'View Complaints', icon: <FaEnvelopeOpenText />, roles: ['super_admin', 'admin', 'warden'] },
        
        // --- STUDENT ITEMS ---
        {
          path: '/hostel-portal',
          label: 'My Residence',
          icon: <FaHotel />,
          roles: ['student'],
          hideIf: role === 'student' && !isHostelResident
        },
        { path: '/my-complaints', label: 'My Complaints', icon: <FaEnvelopeOpenText />, roles: ['student'] },
        { 
          path: '/apply-gatepass', 
          label: 'Apply Gate Pass', 
          icon: <FaTicketAlt />, // UPDATED: Specific icon for applying
          roles: ['student'] 
        },
      ]
    },
    {
      title: "Inventory & Store",
      items: [
        { path: '/inventory', label: 'Inventory', icon: <FaBoxOpen />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/orders', label: 'Orders', icon: <FaShoppingCart />, roles: ['admin', 'super_admin', 'administrator'] },
        { path: '/stationery', label: 'Stationery Store', icon: <FaBoxOpen />, roles: ['student', 'teacher'] },
        { path: '/my-orders', label: 'My Orders', icon: <FaShoppingCart />, roles: ['student', 'teacher'] },
      ]
    },
    {
      title: "Teacher Zone",
      items: [
        { path: '/teacher-subjects', label: 'My Subjects', icon: <FaChalkboardTeacher />, roles: ['teacher', 'super_admin'] },
        { path: '/attendance', label: 'Attendance', icon: <FaCheckSquare />, roles: ['teacher', 'super_admin'] },
        { path: '/online-tests', label: 'Online Tests', icon: <FaClipboardList />, roles: ['teacher', 'super_admin'] },
        { path: '/enter-marks', label: 'Enter Marks', icon: <FaPenNib />, roles: ['teacher', 'super_admin'] },
      ]
    },
    {
      title: "Student Zone",
      items: [
        { path: '/my-subjects', label: 'My Subjects', icon: <FaBook />, roles: ['student'] },
        { path: '/my-attendance', label: 'Attendance', icon: <FaCheckSquare />, roles: ['student'] },
        { path: '/my-results', label: 'Results', icon: <FaPenNib />, roles: ['student'] },
        { path: '/my-invoices', label: 'Invoices', icon: <FaClipboardList />, roles: ['student'] },
        { path: '/admit-card', label: 'Admit Card', icon: <FaIdCard />, roles: ['student'] },
      ]
    },
    {
      title: "Library",
      items: [
        { path: '/books', label: 'Manage Books', icon: <FaBook />, roles: ['librarian', 'super_admin'] },
        { path: '/loans', label: 'Manage Loans', icon: <FaClipboardList />, roles: ['librarian', 'super_admin'] },
        { path: '/library-catalog', label: 'Catalog', icon: <FaBook />, roles: ['teacher', 'student'] },
      ]
    },
    {
      title: "System",
      items: [
        { path: '/roles', label: 'Roles & Permissions', icon: <FaIdBadge />, roles: ['super_admin'] },
        { path: '/activity-logs', label: 'System Logs', icon: <FaUserShield />, roles: ['super_admin'] },
      ]
    }
  ];

  const hasVisibleItems = (groupItems: MenuItem[]) => {
    return groupItems.some(item => (item.roles.includes('all') || item.roles.includes(role)) && !item.hideIf);
  };

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-area">
          <img src={logo} alt="IMS" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group, idx) => (
          hasVisibleItems(group.items) && (
            <div key={idx} className="menu-group">
              <div className="menu-group-title">{group.title}</div>
              {group.items
                .filter(item => (item.roles.includes('all') || item.roles.includes(role)) && !item.hideIf)
                .map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={!isOpen ? item.label : ''}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
            </div>
          )
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;