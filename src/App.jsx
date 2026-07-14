import React, { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import {
  AuthProvider,
  useAuth,
  ThemeProvider,
  NotificationProvider,
  CartProvider,
  SystemProvider,
  SkeletonProvider,
  FavoritesProvider
} from './context'
import { MainLayout, AuthLayout, DashboardLayout } from './layouts'
import {
  Home,
  Login,
  Register,
  UserProfile,
  UserLayout,
  UserDashboard,
  UserWallet,
  UserHistory,
  UserCart,
  Achievements,
  EventManagerDashboard,
  StaffDashboard,
  WelcomePortal,
  ManagerEventDetail,
  ManagerAnalytics,
  ManagerTransactions,
  ManagerAttendees,
  StaffIncidents,
  RefundTracker,
  Maintenance,
  Checkout
} from './pages'
import { adminRoutes, publicRoutes, managerRoutes, staffRoutes } from './routes'
import ProtectedRoute from './components/Guards/ProtectedRoute'
import NotificationContainer from './components/Notifications/NotificationContainer/NotificationContainer'
import DatabaseMonitor from './components/Admin/DatabaseMonitor/DatabaseMonitor'
import SessionManager from './components/Guards/SessionManager'
import MaintenanceGuard from './components/Guards/MaintenanceGuard'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { CartModal } from './components/Cart'
import { LoadingScreen } from './components'
import useLBS from './hooks/useLBS'
// Estilos globales movidos a index.js para control de precedencia

const EventDetail = lazy(() => import('./pages/EventDetail/EventDetail'))
const ClaimTicketPage = lazy(() => import('./pages/ClaimTicket/ClaimTicketPage'))

function AppContent() {
  const { loading, loggingOut } = useAuth()
  const [minDone, setMinDone] = useState(false)
  const startedRef = useRef(false)

  // Initialize LBS Tracking
  useLBS()

  useEffect(() => {
    if (loading || loggingOut) {
      startedRef.current = true
      setMinDone(false)
    } else if (startedRef.current) {
      const t = setTimeout(() => setMinDone(true), 2000)
      return () => clearTimeout(t)
    } else {
      setMinDone(true)
    }
  }, [loading, loggingOut])

  if (loggingOut) return <LoadingScreen label="CERRANDO SESIÓN" status="GUARDANDO DATOS DE SESIÓN..." />;
  if (loading || !minDone) return <LoadingScreen />;

  return (
    <div className='App'>
      <ErrorBoundary>
        <SessionManager />
        <ScrollToTop />
        <MaintenanceGuard>
          <SkeletonProvider minDuration={0}>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path='/maintenance' element={<Maintenance />} />
                {/* ... existing routes ... */}
                {/* Rutas de Autenticación - SIN AuthLayout anidado */}
                {/* Rutas Públicas y de Usuario */}
                <Route element={<MainLayout />}>
                  {/* Rutas de Autenticación */}
                  <Route path='/login' element={<Login />} />
                  <Route path='/register' element={<Register />} />

                  {/* Public Routes from configuration */}
                  {publicRoutes.filter(route => route.layout === 'main').map((route, index) => {
                    const Component = route.element
                    return (
                      <Route
                        key={`public-${index}`}
                        path={route.path}
                        element={<Component />}
                      />
                    )
                  })}

                  {/* Specific routes not in publicRoutes config yet */}
                  <Route path='/event/:id' element={<EventDetail />} />
                  <Route path='/ticket/claim/:token' element={<ClaimTicketPage />} />
                  <Route path='/checkout' element={<Checkout />} />
                  <Route path='/cart' element={<UserCart />} />
                </Route>

                {/* NUEVAS Rutas de Usuario - PROTEGIDAS CONTRA ADN FAN */}
                <Route path='/user' element={
                  <ProtectedRoute allowedRoles={['usuario']}>
                    <UserLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/user/dashboard" replace />} />
                  <Route path='dashboard' element={<UserDashboard />} />
                  <Route path='tickets' element={<UserWallet />} />
                  <Route path='history' element={<UserHistory />} />
                  <Route path='profile' element={<UserProfile />} />
                  <Route path='achievements' element={<Achievements />} />
                  <Route path='refunds' element={<RefundTracker />} />
                </Route>

                {/* Redirect old profile route */}
                <Route path='/profile' element={<Navigate to="/user/profile" replace />} />

                {/* Rutas de Dashboard */}
                <Route element={<DashboardLayout />}>
                  {/* Manager Routes - Explicitly added here to ensure they work */}
                  <Route path='/events/manage/:id' element={
                    <ProtectedRoute allowedRoles={['gestor', 'admin']}>
                      <ManagerEventDetail />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de Admin Dinámicas */}
                  {adminRoutes.map((route, index) => {
                    const Component = route.element
                    return (
                      <Route
                        key={`admin-${index}`}
                        path={route.path}
                        element={
                          <ProtectedRoute allowedRoles={route.allowedRoles}>
                            <Component />
                          </ProtectedRoute>
                        }
                      />
                    )
                  })}

                  {/* Rutas de Manager Dinámicas */}
                  {managerRoutes.map((route, index) => {
                    const Component = route.element
                    return (
                      <Route
                        key={`manager-${index}`}
                        path={route.path}
                        element={
                          <ProtectedRoute allowedRoles={route.allowedRoles}>
                            <Component />
                          </ProtectedRoute>
                        }
                      />
                    )
                  })}

                  {/* Rutas de Staff Dinámicas */}
                  {staffRoutes.map((route, index) => {
                    const Component = route.element
                    return (
                      <Route
                        key={`staff-${index}`}
                        path={route.path}
                        element={
                          <ProtectedRoute allowedRoles={route.allowedRoles}>
                            <Component />
                          </ProtectedRoute>
                        }
                      />
                    )
                  })}



                  {/* Admin - Monitor de Base de Datos (Sistema/Específico) */}
                  <Route
                    path='/admin/database-monitor'
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <DatabaseMonitor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Las rutas de Gestor y Staff ahora se cargan dinámicamente arriba */}
                </Route>

                {/* Welcome Portal - Standalone */}
                <Route
                  path='/welcome'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'gestor', 'operador']}>
                      <WelcomePortal />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect */}
                <Route path='*' element={<Navigate to='/' replace />} />
              </Routes>
            </Suspense>
          </SkeletonProvider>
        </MaintenanceGuard>
      </ErrorBoundary>

      <CartModal />
      <NotificationContainer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SystemProvider>
          <NotificationProvider>
            <CartProvider>
              <FavoritesProvider>
                <AppContent />
              </FavoritesProvider>
            </CartProvider>
          </NotificationProvider>
        </SystemProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
