import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Members from '../pages/Members'
import Plans from '../pages/Plans'
import Payments from '../pages/Payments'
import Attendance from '../pages/Attendance'
import ProjectBoard from '../pages/ProjectBoard'
import PublicWebsite from '../pages/PublicWebsite'
import Register from '../pages/Register'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicWebsite />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'members',
        element: <Members />,
      },
      {
        path: 'plans',
        element: <Plans />,
      },
      {
        path: 'payments',
        element: <Payments />,
      },
      {
        path: 'attendance',
        element: <Attendance />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectBoard />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
