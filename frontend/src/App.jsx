import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import BarberDetailPage from './pages/BarberDetailPage'
import ServicesPage from './pages/ServicesPage'
import BookingPage from './pages/BookingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import BarberDashboard from './pages/BarberDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/barbers/:id" element={<BarberDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barber"
          element={
            <ProtectedRoute role="barber">
              <BarberDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
