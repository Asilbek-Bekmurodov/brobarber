import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((s) => s.auth)

  if (!token || !user) return <Navigate to="/auth" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
