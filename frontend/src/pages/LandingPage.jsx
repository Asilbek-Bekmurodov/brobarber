import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styles from './LandingPage.module.css'

const LandingPage = () => {
  const { user } = useSelector((s) => s.auth)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (user) {
    if (user.role === 'barber') return <Navigate to="/barber" replace />
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />
    return <Navigate to="/home" replace />
  }

  return (
    <div className={styles.page}>

      <header className={`${styles.header} ${scrolled ? styles.headerSolid : ''}`}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>Trim.</span>
          <nav className={styles.nav}>
            <a href="#services" className={styles.navLink}>Services</a>
            <a href="#about" className={styles.navLink}>About</a>
          </nav>
          <div className={styles.authBtns}>
            <Link to="/auth?tab=login" className={styles.signInBtn}>Sign In</Link>
            <Link to="/auth?tab=register" className={styles.registerBtn}>Register</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Premium Barbershop · Toshkent</p>
          <h1 className={styles.heroHeadline}>
            We will make<br />
            <em>you stylish.</em>
          </h1>
          <p className={styles.heroSub}>Expert cuts. Clean fades. The art of the perfect cut.</p>
          <div className={styles.heroCtas}>
            <Link to="/auth?tab=register" className={styles.ctaPrimary}>Book an Appointment</Link>
            <a href="#services" className={styles.ctaSecondary}>View Services</a>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>scroll</span>
        </div>
      </section>

      <section className={styles.stats} id="about">
        <div className={styles.statsInner}>
          {[
            { num: '500+', label: 'Happy Clients' },
            { num: '8+',   label: 'Expert Barbers' },
            { num: '15+',  label: 'Years Experience' },
            { num: '100%', label: 'Satisfaction' },
          ].map(({ num, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.servicesInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>What We Offer</span>
            <h2 className={styles.sectionTitle}>Our Services</h2>
          </div>
          <div className={styles.serviceCards}>
            {[
              { icon: '✂', title: 'Classic Cut',  desc: 'Timeless styles tailored to your face shape and lifestyle.' },
              { icon: '🪒', title: 'Hot Shave',    desc: 'Traditional straight razor shave with hot towels and oils.' },
              { icon: '💈', title: 'Beard Trim',   desc: 'Precision beard shaping, styling and expert grooming.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{icon}</span>
                <h3 className={styles.serviceTitle}>{title}</h3>
                <p className={styles.serviceDesc}>{desc}</p>
                <div className={styles.serviceArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <div>
            <p className={styles.ctaBannerTag}>Ready?</p>
            <h2 className={styles.ctaBannerTitle}>Book your appointment today.</h2>
          </div>
          <Link to="/auth?tab=register" className={styles.ctaBannerBtn}>Get Started</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>Trim.</span>
        <span className={styles.footerCopy}>© 2026 Trim. · Toshkent, O'zbekiston</span>
      </footer>

    </div>
  )
}

export default LandingPage
