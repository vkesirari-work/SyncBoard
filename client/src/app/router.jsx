import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import DashboardHome from '../pages/DashboardHome'
import Login from '../pages/Login'
import Members from '../pages/Members'
import Plans from '../pages/Plans'
import Payments from '../pages/Payments'
import Attendance from '../pages/Attendance'
import Leads from '../pages/Leads'
import Trainers from '../pages/Trainers'
import Renewals from '../pages/Renewals'
import ProjectBoard from '../pages/ProjectBoard'
import PublicWebsite from '../pages/PublicWebsite'
import Register from '../pages/Register'
import Settings from '../pages/Settings'
import Notifications from '../pages/Notifications'
import Analytics from '../pages/Analytics'
import AdminRoute from '../components/auth/AdminRoute'
import TrainingSessions from '../pages/TrainingSessions'
import TrainerAvailability from '../pages/TrainerAvailability'

const adminPage = (element) => <AdminRoute>{element}</AdminRoute>

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
        element: <DashboardHome />,
      },
      {
        path: 'members',
        element: adminPage(<Members />),
      },
      {
        path: 'plans',
        element: adminPage(<Plans />),
      },
      {
        path: 'payments',
        element: adminPage(<Payments />),
      },
      {
        path: 'attendance',
        element: adminPage(<Attendance />),
      },
      {
        path: 'leads',
        element: adminPage(<Leads />),
      },
      {
        path: 'trainers',
        element: adminPage(<Trainers />),
      },
      {
        path: 'sessions',
        element: adminPage(<TrainingSessions />),
      },
      {
        path: 'availability',
        element: adminPage(<TrainerAvailability />),
      },
      {
        path: 'renewals',
        element: adminPage(<Renewals />),
      },
      {
        path: 'settings',
        element: adminPage(<Settings />),
      },
      {
        path: 'notifications',
        element: adminPage(<Notifications />),
      },
      {
        path: 'analytics',
        element: adminPage(<Analytics />),
      },
      {
        path: 'projects/:projectId',
        element: adminPage(<ProjectBoard />),
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
