// client/src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import StaffRegister from './features/auth/StaffRegister';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout'; // Import the layout
import IDCardPage from './pages/IDCardPage';

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
    element: <MainLayout />, // Use the shell here
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      // You can add more pages here later (e.g., /finance, /students)
      {
        path: '/profile',
        element: <div>My Profile Page (Coming Soon)</div>
      },
      {
  path: '/id-card',
  element: <IDCardPage />
}
    ]
  },

  // 404 Route
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  }
]);