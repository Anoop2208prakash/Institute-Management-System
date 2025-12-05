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
import StaffList from './pages/admin/StaffList';

// Academic Pages
import ClassManager from './pages/admin/academic/ClassManager';
import SubjectManager from './pages/admin/academic/SubjectManager';
import SemesterManager from './pages/admin/academic/SemesterManager';
import ExamManager from './pages/admin/academic/ExamManager';

// Inventory Pages
import InventoryManager from './pages/admin/inventory/InventoryManager';
import OrderList from './pages/admin/inventory/OrderList';

// Communication Pages
import AnnouncementManager from './pages/admin/communication/AnnouncementManager';

// Librarian Pages
import BookList from './pages/librarian/BookList';
import LoanManager from './pages/librarian/LoanManager';

// Teacher Pages
import MyClass from './pages/teacher/MyClass';
import AttendanceManager from './pages/teacher/AttendanceManager';
import EnterMarks from './pages/teacher/EnterMarks';

// Common Pages
import AdmissionList from './pages/admin/admission/AdmissionList';
import MyLoans from './components/common/MyLoans';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/staff-register',
    element: <StaffRegister />,
  },
  
  // PROTECTED ROUTES WRAPPED IN MAIN LAYOUT
  {
    element: <MainLayout />,
    children: [
      // --- COMMON ---
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/id-card', element: <IDCardPage /> },

      // --- ADMIN MODULES ---
      { path: '/view-admission', element: <AdmissionList /> },
      { path: '/staff', element: <StaffList /> },
      { path: '/roles', element: <RoleManagement /> },
      
      // Academic
      { path: '/programs', element: <ClassManager /> },
      { path: '/semesters', element: <SemesterManager /> },
      { path: '/subjects', element: <SubjectManager /> },
      { path: '/exams', element: <ExamManager /> },

      // Inventory
      { path: '/inventory', element: <InventoryManager /> },
      { path: '/orders', element: <OrderList /> },

      // Communication
      { path: '/announcements', element: <AnnouncementManager /> },

      // --- LIBRARIAN MODULES ---
      { path: '/books', element: <BookList /> }, // Manage Books (Admin/Librarian)
      { path: '/loans', element: <LoanManager /> },

      // --- TEACHER MODULES ---
      { path: '/my-class', element: <MyClass /> },
      { path: '/attendance', element: <AttendanceManager /> },
      { path: '/enter-marks', element: <EnterMarks /> },

      // --- SHARED MODULES ---
      { path: '/my-loans', element: <MyLoans /> },
      // Reusing BookList for catalog view
      { path: '/library-catalog', element: <BookList /> }, 
    ]
  },

  // 404 Route
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  }
]);