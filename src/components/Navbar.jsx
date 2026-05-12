import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services \u0026 Pricing', path: '/services' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Home')

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
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
      </div>
    </nav>
  )
}

export default Navbar
