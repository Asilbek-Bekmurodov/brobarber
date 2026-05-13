import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styles from './AuthPage.module.css'

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'login')
  const [animating, setAnimating] = useState(false)

  const [loginPhone, setLoginPhone] = useState('')
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regRole, setRegRole] = useState('user')

  const switchTab = (newTab) => {
    if (newTab === tab) return
    setAnimating(true)
    setTimeout(() => {
      setTab(newTab)
      setSearchParams({ tab: newTab })
      setAnimating(false)
    }, 220)
  }

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && t !== tab) setTab(t)
  }, [searchParams])

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 1) return digits
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`
    if (digits.length <= 9) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }

  return (
    <div className={styles.page}>

      {/* ── Left Panel ── */}
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />
        <div className={styles.leftContent}>
          <Link to="/" className={styles.brandLogo}>Trim.</Link>
          <div className={styles.brandDivider} />
          <p className={styles.brandTagline}>
            The art of the<br />perfect cut.
          </p>
          <div className={styles.brandFooter}>
            <span className={styles.brandAddr}>198 West 21st Street, New York</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.right}>
        <Link to="/" className={styles.backLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to home
        </Link>

        <div className={styles.formWrap}>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchTab('login')}
            >
              Sign In
            </button>
            <button
              className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchTab('register')}
            >
              Register
            </button>
          </div>

          <div className={styles.tabIndicatorWrap}>
            <div className={`${styles.tabIndicator} ${tab === 'register' ? styles.tabIndicatorRight : ''}`} />
          </div>

          {/* Form */}
          <div className={`${styles.formInner} ${animating ? styles.formFading : ''}`}>

            {tab === 'login' ? (
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Welcome back.</h1>
                  <p className={styles.formSubtitle}>
                    Enter your phone number to sign in to your account.
                  </p>
                </div>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="login-phone">Phone Number</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </span>
                      <input
                        id="login-phone"
                        type="tel"
                        className={styles.input}
                        placeholder="+1 (000) 000-00-00"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <p className={styles.switchHint}>
                  Don't have an account?{' '}
                  <button type="button" className={styles.switchBtn} onClick={() => switchTab('register')}>
                    Register
                  </button>
                </p>
              </form>

            ) : (
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Create account.</h1>
                  <p className={styles.formSubtitle}>
                    {regRole === 'barber'
                      ? 'Join Trim. as a barber to manage your schedule and clients.'
                      : 'Join Trim. to book appointments and manage your visits.'}
                  </p>
                </div>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <span className={styles.label}>Register as</span>
                    <div className={styles.roleSelector}>
                      <button
                        type="button"
                        className={`${styles.roleCard} ${regRole === 'user' ? styles.roleCardActive : ''}`}
                        onClick={() => setRegRole('user')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Client</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.roleCard} ${regRole === 'barber' ? styles.roleCardActive : ''}`}
                        onClick={() => setRegRole('barber')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="6" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <line x1="20" y1="4" x2="8.12" y2="15.88" />
                          <line x1="14.47" y1="14.48" x2="20" y2="20" />
                          <line x1="8.12" y1="8.12" x2="12" y2="12" />
                        </svg>
                        <span>Barber</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="reg-firstname">First Name</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          id="reg-firstname"
                          type="text"
                          className={styles.input}
                          placeholder="James"
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="reg-lastname">Last Name</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          id="reg-lastname"
                          type="text"
                          className={styles.input}
                          placeholder="Wilson"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-phone">Phone Number</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </span>
                      <input
                        id="reg-phone"
                        type="tel"
                        className={styles.input}
                        placeholder="+1 (000) 000-00-00"
                        value={regPhone}
                        onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Create Account
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <p className={styles.switchHint}>
                  Already have an account?{' '}
                  <button type="button" className={styles.switchBtn} onClick={() => switchTab('login')}>
                    Sign In
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>

    </div>
  )
}

export default AuthPage
