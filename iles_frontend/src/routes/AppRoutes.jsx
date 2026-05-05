import { Route, Routes } from 'react-router-dom'

import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import LogsListPage from '../features/logs/LogsListPage'
import LogDetailPage from '../features/logs/LogDetailPage'
import LogCreatePage from '../features/logs/LogCreatePage'
import PlacementsPage from '../features/placements/PlacementsPage'
import EvaluationsPage from '../features/evaluations/EvaluationsPage'
import UsersPage from '../features/users/UsersPage'
import { Layout } from '../components/ui'
import { ProtectedRoute, RoleGate } from './guards'
import { ROLES } from '../utils/constants'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutRoute />}>
          <Route index element={<DashboardPage />} />

          <Route path="logs" element={<LogsListPage />} />
          <Route path="logs/new" element={<LogCreatePage />} />
          <Route path="logs/:id" element={<LogDetailPage />} />

          <Route path="placements" element={<PlacementsPage />} />
          <Route path="evaluations" element={<EvaluationsPage />} />

          <Route element={<RoleGate allow={[ROLES.ADMIN]} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

import { Outlet } from 'react-router-dom'
function LayoutRoute() {
  return <Layout><Outlet /></Layout>
}

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Page not found</h2>
      <p className="muted">The page you tried to reach does not exist.</p>
    </div>
  )
}
