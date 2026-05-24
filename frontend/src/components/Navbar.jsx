import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { useTheme } from '../context/ThemeContext'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'Home',              path: '/home' },
  { label: 'Services & Pricing', path: '/services' },
]

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { theme, toggle } = useTheme()
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
          <button className={styles.themeToggle} onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

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
