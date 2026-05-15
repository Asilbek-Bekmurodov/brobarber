# Frontend–Backend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing React frontend to the Node.js/MongoDB backend — real auth, real data, protected routes.

**Architecture:** Axios instance with JWT interceptor lives in `src/lib/api.js`. Redux Toolkit `authSlice` holds user/token (persisted in localStorage). Each page fetches from the real API. `/dashboard` is admin-only; booking requires login.

**Tech Stack:** React 19, Redux Toolkit, Axios, React Router v7, Vite, CSS Modules

---

## File Structure

```
frontend/
├── .env                              # VITE_API_URL=http://localhost:5000
├── src/
│   ├── lib/
│   │   └── api.js                    # NEW — axios instance, token injector
│   ├── store/
│   │   ├── authSlice.js              # NEW — login/register/logout thunks + state
│   │   └── index.js                  # MODIFY — add authSlice
│   ├── components/
│   │   └── ProtectedRoute.jsx        # NEW — redirect if not authed / wrong role
│   ├── pages/
│   │   ├── AuthPage.jsx              # MODIFY — wire forms to API, +998 phone
│   │   ├── BookingPage.jsx           # MODIFY — fetch barbers/services from API
│   │   └── DashboardPage.jsx         # MODIFY — fetch real data, admin guard
│   └── App.jsx                       # MODIFY — ProtectedRoute on /dashboard
backend/
└── src/
    └── app.js                        # MODIFY — allow CORS from localhost:5173
```

---

## Task 1: Backend CORS + Frontend env

**Files:**
- Modify: `backend/src/app.js`
- Create: `frontend/.env`

- [ ] **Step 1: Fix CORS in `backend/src/app.js`**

Read the file and replace:
```js
app.use(cors());
```
with:
```js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
```

- [ ] **Step 2: Add `ALLOWED_ORIGINS` to `backend/.env`**

Append to `backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:5173
```

And append to `backend/.env.example`:
```
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] **Step 3: Create `frontend/.env`**

```
VITE_API_URL=http://localhost:5000
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add backend/src/app.js backend/.env.example frontend/.env
git commit -m "feat: configure CORS for frontend dev server"
```

---

## Task 2: Axios API layer

**Files:**
- Create: `frontend/src/lib/api.js`

- [ ] **Step 1: Install axios**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop/frontend"
npm install axios
```

- [ ] **Step 2: Create `frontend/src/lib/api.js`**

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export default api
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/lib/api.js frontend/package-lock.json frontend/package.json
git commit -m "feat: add axios API layer with JWT interceptor"
```

---

## Task 3: Redux Auth Slice

**Files:**
- Create: `frontend/src/store/authSlice.js`
- Modify: `frontend/src/store/index.js`

- [ ] **Step 1: Create `frontend/src/store/authSlice.js`**

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../lib/api'

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
})()
const storedToken = localStorage.getItem('token') || null

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.details?.[0] || 'Registration failed')
  }
})

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const fulfilled = (state, action) => {
      state.loading = false
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    }
    const rejected = (state, action) => {
      state.loading = false
      state.error = action.payload
    }
    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
```

- [ ] **Step 2: Update `frontend/src/store/index.js`**

Replace the entire file:
```js
import { configureStore, createSlice } from '@reduxjs/toolkit'
import authReducer from './authSlice'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isMenuOpen: false,
    activeSection: 'home',
  },
  reducers: {
    toggleMenu: (state) => { state.isMenuOpen = !state.isMenuOpen },
    setActiveSection: (state, action) => { state.activeSection = action.payload },
  },
})

export const { toggleMenu, setActiveSection } = appSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    auth: authReducer,
  },
})
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/store/authSlice.js frontend/src/store/index.js
git commit -m "feat: add Redux auth slice with login/register/logout"
```

---

## Task 4: ProtectedRoute + App.jsx

**Files:**
- Create: `frontend/src/components/ProtectedRoute.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create `frontend/src/components/ProtectedRoute.jsx`**

```jsx
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((s) => s.auth)

  if (!token || !user) return <Navigate to="/auth" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
```

- [ ] **Step 2: Update `frontend/src/App.jsx`**

Replace the entire file:
```jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import BarberDetailPage from './pages/BarberDetailPage'
import ServicesPage from './pages/ServicesPage'
import BookingPage from './pages/BookingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppRoutes() {
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
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}

export default App
```

**Note:** Check if `main.jsx` already wraps in `<Provider store={store}>`. If it does, remove the Provider from App.jsx and keep it in main.jsx only. The important thing is to have exactly one Provider.

- [ ] **Step 3: Check `frontend/src/main.jsx` for existing Provider**

Read `frontend/src/main.jsx`. If it already has `<Provider store={store}>`, remove the Provider wrapper from App.jsx (keep just `<AppRoutes />` exported as `App`).

- [ ] **Step 4: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/components/ProtectedRoute.jsx frontend/src/App.jsx
git commit -m "feat: add ProtectedRoute and wire Provider + routes"
```

---

## Task 5: AuthPage — real API + +998 phone

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`

The current AuthPage has no password field in login (only phone), no password field visible in register, and phone format `+1 (000)`. We need:
- Login: phone + password
- Register: firstName, lastName, phone (+998 format), password — role selector stays (UI only, backend always creates `user`)
- On success: dispatch Redux action, navigate to `/`
- On error: show error message

- [ ] **Step 1: Replace `frontend/src/pages/AuthPage.jsx`**

```jsx
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
    // Keep +998 prefix, allow 9 more digits
    const raw = value.replace(/\D/g, '')
    // raw starts with 998...
    if (raw.length <= 3) return '+' + raw
    const digits = raw.slice(3, 12) // up to 9 digits after 998
    if (digits.length === 0) return '+998'
    if (digits.length <= 2) return `+998 ${digits}`
    if (digits.length <= 5) return `+998 ${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5)}`
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
  }

  const toApiPhone = (formatted) => {
    const digits = formatted.replace(/\D/g, '')
    return '+' + digits
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login({
      phoneNumber: toApiPhone(loginPhone),
      password: loginPassword,
    }))
    if (!result.error) navigate('/')
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(register({
      firstName: regFirstName,
      lastName: regLastName,
      phoneNumber: toApiPhone(regPhone),
      password: regPassword,
    }))
    if (!result.error) navigate('/')
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
            <span className={styles.brandAddr}>Toshkent, O'zbekiston</span>
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
            <button className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => switchTab('register')}>Register</button>
          </div>
          <div className={styles.tabIndicatorWrap}>
            <div className={`${styles.tabIndicator} ${tab === 'register' ? styles.tabIndicatorRight : ''}`} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          {/* Form */}
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
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/pages/AuthPage.jsx
git commit -m "feat: wire AuthPage to real API with +998 phone format"
```

---

## Task 6: BookingPage — real barbers + services

**Files:**
- Modify: `frontend/src/pages/BookingPage.jsx`

Replace hardcoded `SERVICES` and `BARBERS` arrays with API calls. Keep all existing UI and logic — just swap data source.

- [ ] **Step 1: Update `frontend/src/pages/BookingPage.jsx`**

At the top of the file, replace the hardcoded `SERVICES` and `BARBERS` constants and add these imports and hooks:

```jsx
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../lib/api'
import styles from './BookingPage.module.css'
```

Remove the hardcoded `const SERVICES = [...]` and `const BARBERS = [...]` arrays entirely.

Inside the `BookingPage` component, add these state variables and useEffect right after the existing state declarations (`selectedService`, `selectedBarber`, etc.):

```jsx
const { user } = useSelector((s) => s.auth)
const [services, setServices] = useState([])
const [barbers, setBarbers] = useState([])
const [loadingData, setLoadingData] = useState(true)
const [submitLoading, setSubmitLoading] = useState(false)
const [submitError, setSubmitError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const [servicesRes, barbersRes] = await Promise.all([
        api.get('/services'),
        api.get('/barbers'),
      ])
      setServices(servicesRes.data.services)
      setBarbers(barbersRes.data.barbers)
    } catch (err) {
      console.error('Failed to load booking data:', err)
    } finally {
      setLoadingData(false)
    }
  }
  fetchData()
}, [])
```

Replace the confirm handler — change `onClick={() => canConfirm && setConfirmed(true)}` on the Confirm button to:

```jsx
onClick={async () => {
  if (!canConfirm || submitLoading) return
  setSubmitLoading(true)
  setSubmitError(null)
  try {
    const { di, hi } = selectedSlot
    const date = weekDates[di].toISOString().slice(0, 10)
    const time = HOURS[hi]
    await api.post('/bookings', {
      barber: selectedBarber._id,
      service: selectedService._id,
      date,
      time,
    })
    setConfirmed(true)
  } catch (err) {
    setSubmitError(err.response?.data?.message || 'Booking failed')
  } finally {
    setSubmitLoading(false)
  }
}}
```

Update the loading state in the JSX — wrap the main return with a loading check:

```jsx
if (loadingData) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-muted, #888)', fontSize: '14px' }}>
      Loading…
    </div>
  )
}
```

In the services section, replace `{SERVICES.map(...)` with `{services.map(...)` and update the service object access:
- `service.id` → `service._id`
- `service.title` → `service.name`
- `service.price` → `$${service.price}`
- Remove `service.icon` references (use a generic scissors icon for all)

In the barbers section, replace `{BARBERS.map(...)` with `{barbers.map(...)` and update:
- `barber.id` → `barber._id`
- `barber.name` → `${barber.firstName} ${barber.lastName}`
- `barber.image` → use a placeholder or remove `<img>` (barbers in DB have no image field)
- `barber.role` → `barber.role` (keep as-is)
- `barber.specialty` → `barber.bio || ''`

Show `submitError` above the confirm button if present.

Also update `seedBooked` to use `barber._id` instead of `barber.id`.

- [ ] **Step 2: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/pages/BookingPage.jsx
git commit -m "feat: BookingPage fetches real barbers and services from API"
```

---

## Task 7: DashboardPage — real data + admin guard

**Files:**
- Modify: `frontend/src/pages/DashboardPage.jsx`

The DashboardPage currently uses mock data. Replace mock data with API calls. The route is already protected by `ProtectedRoute role="admin"` from Task 4.

- [ ] **Step 1: Update `frontend/src/pages/DashboardPage.jsx`**

Add imports at the top:
```jsx
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import api from '../lib/api'
import styles from './DashboardPage.module.css'
```

Remove `INITIAL_USERS`, `INITIAL_BARBERS`, `INITIAL_SERVICES` constants entirely.

In the main `DashboardPage` component, replace the `useState('overview')` section with:

```jsx
const dispatch = useDispatch()
const navigate = useNavigate()
const { user } = useSelector((s) => s.auth)
const [active, setActive] = useState('overview')
const [users, setUsers] = useState([])
const [barbers, setBarbers] = useState([])
const [services, setServices] = useState([])
const [bookings, setBookings] = useState([])
const [loading, setLoading] = useState(true)

const fetchAll = useCallback(async () => {
  setLoading(true)
  try {
    const [usersRes, barbersRes, servicesRes, bookingsRes] = await Promise.all([
      api.get('/users'),
      api.get('/barbers'),
      api.get('/services'),
      api.get('/bookings'),
    ])
    setUsers(usersRes.data.users)
    setBarbers(barbersRes.data.barbers)
    setServices(servicesRes.data.services)
    setBookings(bookingsRes.data.bookings)
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => { fetchAll() }, [fetchAll])

const handleLogout = () => {
  dispatch(logout())
  navigate('/')
}
```

Update the sidebar profile section to show real user:
- Replace hardcoded `'Marcus Webb'` → `` `${user?.firstName} ${user?.lastName}` ``
- Replace hardcoded `'Administrator'` → `user?.role`
- Replace hardcoded `'M'` avatar → `user?.firstName?.[0]?.toUpperCase() || 'A'`

Wire the logout button: `onClick={handleLogout}`

Update `OverviewSection` call to pass real data:
```jsx
{active === 'overview' && !loading && (
  <OverviewSection users={users} barbers={barbers} services={services} bookings={bookings} />
)}
```

Update `OverviewSection` props and stats — add bookings count:
```jsx
function OverviewSection({ users, barbers, services, bookings }) {
  const activeServices = services.filter(s => s.status !== false).length
  const stats = [
    { label: 'Total Users', value: users.length, icon: <IconUsers />, note: 'Registered accounts' },
    { label: 'Total Barbers', value: barbers.length, icon: <IconScissors />, note: 'Team members' },
    { label: 'Active Services', value: services.length, icon: <IconList />, note: 'In catalogue' },
    { label: 'Total Bookings', value: bookings.length, icon: <IconCalendar />, note: 'All time' },
  ]
  // ... rest of component unchanged
}
```

Update `UsersSection` — change to receive `rows` and `setRows` as props (data managed in parent):
```jsx
function UsersSection({ rows, onDelete }) {
```
And pass real delete handler that calls `api.delete('/users/' + id)` then refreshes.

For the barbers and services sections — since the admin creates barbers/services via the backend in a real app, wire Add/Edit/Delete to API calls. For now, make delete call the API and refresh. Add/Edit can remain local-only for this iteration (display only what's in the DB).

**Simplest approach** — just show the data read-only for barbers and services in the dashboard, and wire delete for users:

Update `UsersSection` to accept props:
```jsx
function UsersSection({ rows, onRefresh }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let r = rows.map(u => ({
      ...u,
      name: `${u.firstName} ${u.lastName}`,
      phone: u.phoneNumber,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      joined: u.createdAt,
    }))
    r = r.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'za') r = [...r].sort((a, b) => b.name.localeCompare(a.name))
    if (sort === 'newest') r = [...r].sort((a, b) => new Date(b.joined) - new Date(a.joined))
    if (sort === 'oldest') r = [...r].sort((a, b) => new Date(a.joined) - new Date(b.joined))
    return r
  }, [rows, search, sort])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      onRefresh()
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setConfirmDelete(null)
  }

  // ... rest of render using filtered, handleDelete — keep existing table JSX
}
```

Pass props in DashboardPage:
```jsx
{active === 'users' && <UsersSection rows={users} onRefresh={fetchAll} />}
{active === 'barbers' && <BarbersSection rows={barbers} />}
{active === 'services' && <ServicesSection rows={services} />}
```

Update `BarbersSection` and `ServicesSection` to accept `rows` prop and map fields:
- Barber: `name` → `${r.firstName} ${r.lastName}`, `role` → `r.role`, `experience` → `''`, `specialty` → `r.bio`
- Service: `title` → `r.name`, `price` → `$${r.price}`, `duration` → `${r.duration} min`, `category` → `''`

Add loading state in main JSX:
```jsx
{loading && (
  <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading…</div>
)}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add frontend/src/pages/DashboardPage.jsx
git commit -m "feat: DashboardPage fetches real data from API, wires logout"
```

---

## Task 8: Final integration check

- [ ] **Step 1: Start both servers**

Terminal 1 — backend:
```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop/backend"
npm run dev
```
Expected: `Server on port 5000`, `MongoDB connected: localhost`

Terminal 2 — frontend:
```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop/frontend"
npm run dev
```
Expected: `Local: http://localhost:5173`

- [ ] **Step 2: Smoke test auth flow**

1. Open `http://localhost:5173/auth`
2. Register: `Ali`, `Karimov`, `+998901234567`, `secret123` → should redirect to `/`
3. Open `http://localhost:5173/auth` → should redirect to `/` (already logged in)
4. Open `http://localhost:5173/booking` → should load with real barbers/services
5. Open DevTools → Application → localStorage → confirm `token` and `user` keys exist

- [ ] **Step 3: Smoke test booking flow**

1. Go to `/booking`, select a service, barber, time slot
2. Click Confirm — should send `POST /api/bookings`
3. Check backend terminal for request log
4. Should show confirmation screen

- [ ] **Step 4: Smoke test logout**

1. Go to `/dashboard` — should redirect to `/auth` (user role, not admin)
2. Open localStorage, manually set `user` role to `admin` for testing
3. Or: register a user then update role in MongoDB directly:
   ```
   mongosh barbershop
   db.users.updateOne({ phoneNumber: '+998901234567' }, { $set: { role: 'admin' } })
   ```
4. Log out and log back in → `/dashboard` should now work

- [ ] **Step 5: Final commit + push**

```bash
cd "/Users/asilbekbekmurodov/Documents/ai websites/barbershop"
git add .
git commit -m "feat: complete frontend-backend integration"
git push origin main
```

---

## API calls summary

| Page | API calls |
|------|-----------|
| AuthPage | POST /api/auth/register, POST /api/auth/login |
| BookingPage | GET /api/barbers, GET /api/services, POST /api/bookings |
| DashboardPage | GET /api/users, GET /api/barbers, GET /api/services, GET /api/bookings |
| ProtectedRoute | Reads Redux store (no API call) |
