import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user.role)) return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
