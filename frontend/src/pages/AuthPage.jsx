import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, register, clearError } from '../store/authSlice'
import styles from './AuthPage.module.css'

const AuthPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((s) => s.auth)

  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'login')
  const [animating, setAnimating] = useState(false)

  const [loginPhone, setLoginPhone] = useState('+998')
  const [loginPassword, setLoginPassword] = useState('')

  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regPhone, setRegPhone] = useState('+998')
  const [regPassword, setRegPassword] = useState('')
  const [isBarber, setIsBarber] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [tab, dispatch])

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
    const raw = value.replace(/\D/g, '')
    if (raw.length <= 3) return '+' + raw
    const digits = raw.slice(3, 12)
    if (digits.length === 0) return '+998'
    if (digits.length <= 2) return `+998 ${digits}`
    if (digits.length <= 5) return `+998 ${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5)}`
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
  }

  const toApiPhone = (formatted) => '+' + formatted.replace(/\D/g, '')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login({
      phoneNumber: toApiPhone(loginPhone),
      password: loginPassword,
    }))
    if (!result.error) {
      const redirectTo = searchParams.get('redirect')
      if (redirectTo) return navigate(redirectTo)
      const role = result.payload?.user?.role
      navigate(role === 'barber' ? '/barber' : role === 'admin' ? '/dashboard' : '/')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(register({
      firstName: regFirstName,
      lastName: regLastName,
      phoneNumber: toApiPhone(regPhone),
      password: regPassword,
      role: isBarber ? 'barber' : 'user',
    }))
    if (!result.error) {
      const redirectTo = searchParams.get('redirect')
      if (redirectTo) return navigate(redirectTo)
      navigate(isBarber ? '/barber' : '/')
    }
  }

  return (
    <div className={styles.page}>

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
            <span className={styles.brandAddr}>Toshkent, O'zbekiston</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <Link to="/" className={styles.backLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to home
        </Link>

        <div className={styles.formWrap}>

          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => switchTab('register')}>Register</button>
          </div>
          <div className={styles.tabIndicatorWrap}>
            <div className={`${styles.tabIndicator} ${tab === 'register' ? styles.tabIndicatorRight : ''}`} />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <div className={`${styles.formInner} ${animating ? styles.formFading : ''}`}>

            {tab === 'login' ? (
              <form className={styles.form} onSubmit={handleLoginSubmit}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Welcome back.</h1>
                  <p className={styles.formSubtitle}>Enter your phone and password to sign in.</p>
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
                        placeholder="+998 90 123-45-67"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="login-password">Password</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                      <input
                        id="login-password"
                        type="password"
                        className={styles.input}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                  {!loading && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>

                <p className={styles.switchHint}>
                  Don't have an account?{' '}
                  <button type="button" className={styles.switchBtn} onClick={() => switchTab('register')}>Register</button>
                </p>
              </form>

            ) : (
              <form className={styles.form} onSubmit={handleRegisterSubmit}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Create account.</h1>
                  <p className={styles.formSubtitle}>Join Trim. to book appointments.</p>
                </div>

                <div className={styles.fields}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="reg-firstname">First Name</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input id="reg-firstname" type="text" className={styles.input} placeholder="Ali" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="reg-lastname">Last Name</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input id="reg-lastname" type="text" className={styles.input} placeholder="Karimov" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
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
                      <input id="reg-phone" type="tel" className={styles.input} placeholder="+998 90 123-45-67" value={regPhone} onChange={(e) => setRegPhone(formatPhone(e.target.value))} required />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-password">Password</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                      <input id="reg-password" type="password" className={styles.input} placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isBarber}
                      onChange={(e) => setIsBarber(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#c9a96e', cursor: 'pointer' }}
                    />
                    <span>Men barber sifatida ro'yxatdan o'taman</span>
                  </label>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating…' : 'Create Account'}
                  {!loading && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>

                <p className={styles.switchHint}>
                  Already have an account?{' '}
                  <button type="button" className={styles.switchBtn} onClick={() => switchTab('login')}>Sign In</button>
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
