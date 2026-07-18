import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminRoute from '../components/auth/AdminRoute'
import { Analytics, Attendance, DashboardHome, Leads, Login, MemberProgress, Members, Notifications, Payments, Plans, PublicWebsite, Register, Renewals, RoutePage, Settings, StaffSecurity, TrainerAvailability, Trainers, TrainingSessions } from './route-pages'

const page = (element) => <RoutePage>{element}</RoutePage>

const adminPage = (element, permission, ownerOnly = false) => page(<AdminRoute permission={permission} ownerOnly={ownerOnly}>{element}</AdminRoute>)

export const router = createBrowserRouter([
  {
    path: '/',
    element: page(<PublicWebsite />),
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
        element: page(<DashboardHome />),
      },
      {
        path: 'members',
        element: adminPage(<Members />, 'members'),
      },
      {
        path: 'progress/:memberId',
        element: page(<MemberProgress />),
      },
      {
        path: 'plans',
        element: adminPage(<Plans />, 'plans'),
      },
      {
        path: 'payments',
        element: adminPage(<Payments />, 'payments'),
      },
      {
        path: 'attendance',
        element: adminPage(<Attendance />, 'attendance'),
      },
      {
        path: 'leads',
        element: adminPage(<Leads />, 'leads'),
      },
      {
        path: 'trainers',
        element: adminPage(<Trainers />, 'trainers'),
      },
      {
        path: 'sessions',
        element: adminPage(<TrainingSessions />, 'sessions'),
      },
      {
        path: 'availability',
        element: adminPage(<TrainerAvailability />, 'trainers'),
      },
      {
        path: 'renewals',
        element: adminPage(<Renewals />, 'members'),
      },
      {
        path: 'settings',
        element: adminPage(<Settings />, 'settings'),
      },
      {
        path: 'notifications',
        element: adminPage(<Notifications />, 'notifications'),
      },
      {
        path: 'analytics',
        element: adminPage(<Analytics />, 'analytics'),
      },
      {
        path: 'staff-security',
        element: adminPage(<StaffSecurity />, null, true),
      },
    ],
  },
  {
    path: '/login',
    element: page(<Login />),
  },
  {
    path: '/register',
    element: page(<Register />),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
