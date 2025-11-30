// client/src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import StaffRegister from './features/auth/StaffRegister';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import IDCardPage from './pages/IDCardPage';
import ProfilePage from './pages/ProfilePage'; // <--- 1. Import Profile Page

// Admin Pages
import RoleManagement from './pages/admin/RoleManagement';
import StaffList from './pages/admin/StaffList';
import AdmissionList from './pages/admin/admission/AdmissionList';
import NewAdmissionPage from './pages/admin/admission/NewAdmissionPage';

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
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/profile',
        element: <ProfilePage /> // <--- 2. Use the Component here (removed placeholder)
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
        path : '/view-admission',
        element: <AdmissionList />
      },
      {
        path : '/new-admission',
        element: <NewAdmissionPage />
      }
    ]
  },

  // 404 Route
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  }
]);