// client/src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import StaffRegister from './features/auth/StaffRegister';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import IDCardPage from './pages/IDCardPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import RoleManagement from './pages/admin/RoleManagement';
import StaffList from './pages/admin/StaffList'; // "Manage Staff"
// import GenericPage from './pages/admin/GenericPage'; // Placeholder for new pages

// Librarian Pages
import BookList from './pages/librarian/BookList';
import LoanManager from './pages/librarian/LoanManager';
import AdmissionList from './pages/admin/admission/AdmissionList';
import ClassManager from './pages/admin/academic/ClassManager';
import SubjectManager from './pages/admin/academic/SubjectManager';
import SemesterManager from './pages/admin/academic/SemesterManager';
import ExamManager from './pages/admin/academic/ExamManager';
import InventoryManager from './pages/admin/inventory/InventoryManager';
import OrderList from './pages/admin/inventory/OrderList';
import AnnouncementManager from './pages/admin/communication/AnnouncementManager';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/staff-register', element: <StaffRegister /> }, // "New Admission" for Staff/Admin
  
  {
    element: <MainLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/id-card', element: <IDCardPage /> },
      
      // --- ADMIN ROUTES ---
      { path: '/view-admission', element: <AdmissionList /> },
      { path: '/staff', element: <StaffList /> },
      { path: '/roles', element: <RoleManagement /> },
      
      // New Placeholders (To be built next)
      { path: '/programs', element: <ClassManager /> },
      { path: '/semesters', element: <SemesterManager /> },
      { path: '/subjects', element: <SubjectManager /> },
      { path: '/exams', element: <ExamManager /> },
      { path: '/inventory', element: <InventoryManager /> },
      { path: '/orders', element: <OrderList /> },
      { path: '/announcements', element: <AnnouncementManager /> },

      // --- LIBRARIAN ROUTES ---
      { path: '/books', element: <BookList /> },
      { path: '/loans', element: <LoanManager /> },
    ]
  },
  { path: '*', element: <div>404 - Page Not Found</div> }
]);