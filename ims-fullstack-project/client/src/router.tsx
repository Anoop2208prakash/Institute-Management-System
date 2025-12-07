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
import ClassManager from './pages/admin/academic/ClassManager';
import SubjectManager from './pages/admin/academic/SubjectManager';
import SemesterManager from './pages/admin/academic/SemesterManager';
import ExamManager from './pages/admin/academic/ExamManager';
import InventoryManager from './pages/admin/inventory/InventoryManager';
import OrderList from './pages/admin/inventory/OrderList';
import AnnouncementManager from './pages/admin/communication/AnnouncementManager';

// Librarian Pages
import BookList from './pages/librarian/BookList';
import LoanManager from './pages/librarian/LoanManager';

// Teacher Pages
import EnterMarks from './pages/teacher/EnterMarks';
import AttendanceManager from './pages/teacher/AttendanceManager';
import NewAdmissionPage from './pages/admin/admission/NewAdmissionPage';
import AdmissionList from './pages/admin/admission/AdmissionList';
import StationeryStore from './pages/student/StationeryStore';
import AdmitCardPage from './pages/student/AdmitCardPage';
import MySubjects from './pages/student/MySubjects';
import MyAttendance from './pages/student/MyAttendance';
import MyResults from './pages/student/MyResults';
import MyInvoices from './pages/student/MyInvoices';
import MyOrders from './pages/student/MyOrders';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import OnlineTestManager from './pages/teacher/OnlineTestManager';

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
  {
    path: '/new-admission',
    element: <NewAdmissionPage />,
  },
  
  // PROTECTED ROUTES WRAPPED IN MAIN LAYOUT
  {
    element: <MainLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/id-card',
        element: <IDCardPage />
      },
      
      // --- ADMIN MODULES ---
      {
        path: '/roles',
        element: <RoleManagement />
      },
      {
        path: '/staff',
        element: <StaffList />
      },
      {
        path: '/view-admission',
        element: <AdmissionList />
      },
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
      { path: '/library-catalog', element: <BookList /> }, // Reuse BookList for catalog

      // --- TEACHER ROUTES ---
      { path: '/teacher-subjects', element: <TeacherSubjects /> },
      { path: '/attendance', element: <AttendanceManager /> },
      { path: '/enter-marks', element: <EnterMarks /> },
      { path: '/online-tests', element: <OnlineTestManager /> },
      
      // --- STUDENT ROUTES ---
      { path: '/stationery', element: <StationeryStore /> },
      { path: '/admit-card', element: <AdmitCardPage /> },
      { path: '/my-subjects', element: <MySubjects /> },
      { path: '/my-attendance', element: <MyAttendance /> },
      { path: '/my-results', element: <MyResults /> },
      { path: '/my-invoices', element: <MyInvoices /> },
      { path: '/my-orders', element: <MyOrders /> },
      // REMOVED: My Loans
    ]
  },

  // 404 Route
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  }
]);