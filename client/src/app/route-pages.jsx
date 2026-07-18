import { lazy, Suspense } from 'react'

export const DashboardHome = lazy(() => import('../pages/DashboardHome'))
export const Login = lazy(() => import('../pages/Login'))
export const Members = lazy(() => import('../pages/Members'))
export const Plans = lazy(() => import('../pages/Plans'))
export const Payments = lazy(() => import('../pages/Payments'))
export const Attendance = lazy(() => import('../pages/Attendance'))
export const Leads = lazy(() => import('../pages/Leads'))
export const Trainers = lazy(() => import('../pages/Trainers'))
export const Renewals = lazy(() => import('../pages/Renewals'))
export const PublicWebsite = lazy(() => import('../pages/PublicWebsite'))
export const Register = lazy(() => import('../pages/Register'))
export const Settings = lazy(() => import('../pages/Settings'))
export const Notifications = lazy(() => import('../pages/Notifications'))
export const Analytics = lazy(() => import('../pages/Analytics'))
export const TrainingSessions = lazy(() => import('../pages/TrainingSessions'))
export const TrainerAvailability = lazy(() => import('../pages/TrainerAvailability'))
export const StaffSecurity = lazy(() => import('../pages/StaffSecurity'))
export const MemberProgress = lazy(() => import('../pages/MemberProgress'))

export function RoutePage({ children }) {
  return <Suspense fallback={<div className="route-loading" role="status">Loading…</div>}>{children}</Suspense>
}
