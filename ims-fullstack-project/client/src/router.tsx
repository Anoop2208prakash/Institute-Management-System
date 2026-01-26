// client/src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
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

// Admin Admission Pages
import NewAdmissionPage from './pages/admin/admission/NewAdmissionPage';
import AdmissionList from './pages/admin/admission/AdmissionList';
import InquiryList from './pages/admin/admission/InquiryList';

// Admin Hostel Management Pages
import HostelManagement from './pages/admin/hostel/HostelManagement';
import RoomAllocation from './pages/admin/hostel/RoomAllocation';
import ViewHostelStudents from './pages/admin/hostel/ViewHostelStudents';
import ManageGatePasses from './pages/admin/hostel/ManageGatePasses'; // NEW IMPORT
import ViewComplaints from './pages/admin/hostel/ViewComplaints';

// Librarian Pages
import BookList from './pages/librarian/BookList';
import LoanManager from './pages/librarian/LoanManager';

// Teacher Pages
import EnterMarks from './pages/teacher/EnterMarks';
import AttendanceManager from './pages/teacher/AttendanceManager';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import OnlineTestManager from './pages/teacher/OnlineTestManager';
import { AddQuestionsStepper } from './pages/teacher/AddQuestionsStepper';

// Student Pages
import StationeryStore from './pages/student/StationeryStore';
import AdmitCardPage from './pages/student/AdmitCardPage';
import MySubjects from './pages/student/MySubjects';
import MyAttendance from './pages/student/MyAttendance';
import MyResults from './pages/student/MyResults';
import MyInvoices from './pages/student/MyInvoices';
import MyOrders from './pages/student/MyOrders';
import HostelPortal from './pages/student/HostelPortal';
import MyComplaints from './pages/student/MyComplaints';
import ApplyGatePass from './pages/student/ApplyGatePass'; // Ensure this is the correct path

import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import GatePassHistory from './pages/admin/hostel/GatePassHistory';
import SystemLogs from './pages/admin/SystemLogs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
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
      { path: '/roles', element: <RoleManagement /> },
      { path: '/staff', element: <StaffList /> },
      { path: '/new-admission', element: <NewAdmissionPage /> },
      { path: '/view-admission', element: <AdmissionList /> },
      { path: '/programs', element: <ClassManager /> },
      { path: '/semesters', element: <SemesterManager /> },
      { path: '/subjects', element: <SubjectManager /> },
      { path: '/exams', element: <ExamManager /> },
      { path: '/inventory', element: <InventoryManager /> },
      { path: '/orders', element: <OrderList /> },
      { path: '/announcements', element: <AnnouncementManager /> },

      // --- HOSTEL MODULE ROUTES ---
      {
        path: '/hostel-management',
        element: <HostelManagement />
      },
      {
        path: '/room-allocation',
        element: <RoomAllocation />
      },
      {
        path: '/view-students',
        element: <ViewHostelStudents />
      },
      {
        path: '/manage-gatepasses', // UPDATED: Changed from gate-passes to ManageGatePasses
        element: <ManageGatePasses />
      },
      {
        path: '/view-complaints',
        element: <ViewComplaints />
      },
      {
        path: '/gatepass-history',
        element: <GatePassHistory />
      },

      // --- STUDENT HOSTEL ROUTES ---
      {
        path: '/hostel-portal',
        element: <HostelPortal />
      },
      {
        path: '/my-complaints',
        element: <MyComplaints />
      },
      {
        path: '/apply-gatepass',
        element: <ApplyGatePass /> // UPDATED: Removed modal-specific props for standalone page
      },

      // --- LIBRARIAN ROUTES ---
      { path: '/books', element: <BookList /> },
      { path: '/loans', element: <LoanManager /> },
      { path: '/library-catalog', element: <BookList /> },

      // --- TEACHER ROUTES ---
      { path: '/teacher-subjects', element: <TeacherSubjects /> },
      { path: '/attendance', element: <AttendanceManager /> },
      { path: '/enter-marks', element: <EnterMarks /> },
      { path: '/online-tests', element: <OnlineTestManager /> },
      {
        path: '/teacher/tests/:id/questions',
        element: <AddQuestionsStepper
          isOpen={true}
          onClose={() => window.history.back()}
          examId={window.location.pathname.split('/')[3]}
          onSave={async () => { }}
        />
      },
      {
    path: '/system-logs',
    element: <SystemLogs />,
  },

      // --- STUDENT ROUTES ---
      { path: '/stationery', element: <StationeryStore /> },
      { path: '/admit-card', element: <AdmitCardPage /> },
      { path: '/my-subjects', element: <MySubjects /> },
      { path: '/my-attendance', element: <MyAttendance /> },
      { path: '/my-results', element: <MyResults /> },
      { path: '/my-invoices', element: <MyInvoices /> },
      { path: '/my-orders', element: <MyOrders /> },
      { path: '/inquiries', element: <InquiryList /> }
    ]
  },

  // 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  }

]);