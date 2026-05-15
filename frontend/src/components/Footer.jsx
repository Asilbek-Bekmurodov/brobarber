import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services & Pricing', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

const SERVICES = [
  'Classic Haircuts',
  'Fade & Taper',
  'Beard & Shaving',
  'Hair Coloring',
  'Hair Treatments',
  'Luxury Packages',
]

const HOURS = [
  { day: 'Monday – Friday', time: '8:00 am – 9:00 pm' },
  { day: 'Saturday', time: '9:00 am – 7:00 pm' },
  { day: 'Sunday', time: '10:00 am – 6:00 pm' },
]

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* ── Wordmark ── */}
        <div className={styles.wordmarkWrap}>
          <Link to="/" className={styles.wordmark}>Trim.</Link>
          <p className={styles.tagline}>The art of the perfect cut.</p>
          <div className={styles.goldLine} />
        </div>

        {/* ── Columns ── */}
        <div className={styles.columns}>

          <div className={styles.col}>
            <span className={styles.colTitle}>Navigate</span>
            <ul className={styles.colList}>
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={styles.colLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>Services</span>
            <ul className={styles.colList}>
              {SERVICES.map((s) => (
                <li key={s} className={styles.colText}>{s}</li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>Opening Hours</span>
            <ul className={styles.colList}>
              {HOURS.map((h) => (
                <li key={h.day} className={styles.hoursRow}>
                  <span className={styles.hoursDay}>{h.day}</span>
                  <span className={styles.hoursTime}>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>Find Us</span>
            <address className={styles.address}>
              198 West 21st Street<br />
              Suite 721<br />
              New York, NY 10016
            </address>
            <div className={styles.socialRow}>
              <a href="tel:+0001234567890" className={styles.socialLink} aria-label="Phone">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </a>
              <a href="https://t.me/trimbarbershop" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Telegram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.22 14.602l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.596.984z" />
                </svg>
              </a>
              <a href="https://instagram.com/trimbarbershop" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://facebook.com/trimbarbershop" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* ── Bottom Strip ── */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} Trim. All rights reserved.
          </span>
          <div className={styles.bottomCenter}>
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
          </div>
          <button onClick={scrollToTop} className={styles.toTopBtn} aria-label="Back to top">
            Back to top
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

      </div>
    </footer>
  )
}

export default Footer
