import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { AppShell, PlatformShell } from './components/layout'
import { RequireAuth, RequireRole } from './auth/guards'
import { useAuth } from './auth/AuthProvider'
import { homeFor } from './lib/navigation'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import TrackingPage from './pages/TrackingPage'
import DashboardPage from './pages/DashboardPage'
import CasesPage from './pages/CasesPage'
import CaseDetailPage from './pages/CaseDetailPage'
import MissionsPage from './pages/MissionsPage'
import MesMissionsPage from './pages/MesMissionsPage'
import MissionDetailPage from './pages/MissionDetailPage'
import UsersPage from './pages/UsersPage'
import TenantsPage from './pages/TenantsPage'
import NotFoundPage from './pages/NotFoundPage'

/** « / » : landing page pour les visiteurs, accueil du rôle pour les connectés. */
function LandingOrHome() {
  const { user } = useAuth()
  if (user) return <Navigate to={homeFor(user.role)} replace />
  return <LandingPage />
}

function CaseRedirect() {
  const { id = '' } = useParams()
  return <Navigate to={`/dossiers/${id}`} replace />
}

/** Cabine : ADMIN / ASSISTANT / COLLABORATEUR. */
function Protected() {
  return (
    <RequireAuth>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireAuth>
  )
}

/** Administration de la plateforme : SUPER_ADMIN uniquement. */
function PlatformProtected() {
  return (
    <RequireAuth>
      <PlatformShell>
        <Outlet />
      </PlatformShell>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingOrHome />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Suivi client — page publique (aucune authentification requise). */}
      <Route path="/suivi" element={<TrackingPage />} />
      <Route path="/suivi/:code" element={<TrackingPage />} />

      {/* Anciens chemins redirigés (liens/bookmarks existants). */}
      <Route path="/cases" element={<Navigate to="/dossiers" replace />} />
      <Route path="/cases/:id" element={<CaseRedirect />} />
      <Route path="/users" element={<Navigate to="/utilisateurs" replace />} />
      <Route path="/tenants" element={<Navigate to="/platform/offices" replace />} />

      <Route element={<Protected />}>
        <Route
          path="dashboard"
          element={
            <RequireRole roles={['ADMIN', 'ASSISTANT']}>
              <DashboardPage />
            </RequireRole>
          }
        />

        <Route
          path="dossiers"
          element={
            <RequireRole roles={['ADMIN', 'ASSISTANT']}>
              <CasesPage />
            </RequireRole>
          }
        />
        <Route
          path="dossiers/:id"
          element={
            <RequireRole roles={['ADMIN', 'ASSISTANT']}>
              <CaseDetailPage />
            </RequireRole>
          }
        />

        <Route
          path="missions"
          element={
            <RequireRole roles={['ADMIN']}>
              <MissionsPage />
            </RequireRole>
          }
        />
        <Route
          path="mes-missions"
          element={
            <RequireRole roles={['COLLABORATEUR']}>
              <MesMissionsPage />
            </RequireRole>
          }
        />
        <Route
          path="missions/:id"
          element={
            <RequireRole roles={['ADMIN', 'COLLABORATEUR']}>
              <MissionDetailPage />
            </RequireRole>
          }
        />

        <Route
          path="utilisateurs"
          element={
            <RequireRole roles={['ADMIN']}>
              <UsersPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<PlatformProtected />}>
        <Route path="platform" element={<Navigate to="/platform/offices" replace />} />
        <Route
          path="platform/offices"
          element={
            <RequireRole roles={['SUPER_ADMIN']}>
              <TenantsPage />
            </RequireRole>
          }
        />
        <Route path="platform/*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}