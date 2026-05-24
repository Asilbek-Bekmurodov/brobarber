import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'Home',              path: '/home' },
  { label: 'Services & Pricing', path: '/services' },
]

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [activeLink, setActiveLink] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'admin'  ? '/dashboard' :
    user?.role === 'barber' ? '/barber'    : '/home'

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to={user ? dashboardPath : '/'} className={styles.logo}>
          Trim.
        </Link>

        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className={`${styles.link} ${activeLink === link.label ? styles.active : ''}`}
                onClick={() => setActiveLink(link.label)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.authButtons}>
          {user ? (
            <>
              <span className={styles.userName}>
                {user.firstName} {user.lastName}
              </span>
              {user.role !== 'user' && (
                <Link to={dashboardPath} className={styles.dashboardBtn}>
                  {user.role === 'admin' ? 'Dashboard' : 'My Panel'}
                </Link>
              )}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth?tab=login"    className={styles.signInBtn}>Sign In</Link>
              <Link to="/auth?tab=register" className={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
