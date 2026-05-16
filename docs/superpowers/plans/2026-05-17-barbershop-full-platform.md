# Barbershop Full Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add barber registration + dashboard (services CRUD, schedule builder, clients), replace fake booking slots with real schedule-driven availability, and add auth-redirect booking flow with post-booking confirmation banner.

**Architecture:** New `Schedule` MongoDB model drives slot generation on the backend; a `GET /api/bookings/slots` endpoint returns real availability. Barbers get a dedicated `/barber` route (ProtectedRoute role="barber") with three tabs. Auth redirect is handled via URL search params passed through the login flow.

**Tech Stack:** Node.js/Express/Mongoose (backend), React 19/Vite/Redux Toolkit/Axios (frontend), CSS Modules (styling follows existing dark theme).

---

## File Map

**Create:**
- `backend/src/models/Schedule.js`
- `backend/src/controllers/schedule.controller.js`
- `backend/src/routes/schedule.routes.js`
- `frontend/src/pages/BarberDashboard.jsx`
- `frontend/src/pages/BarberDashboard.module.css`
- `frontend/src/store/bookingSlice.js`

**Modify:**
- `backend/src/app.js` — register schedule routes
- `backend/src/controllers/auth.controller.js` — accept `role` in register
- `backend/src/controllers/service.controller.js` — ownership check in update/delete
- `backend/src/controllers/booking.controller.js` — add `getAvailableSlots`
- `backend/src/routes/booking.routes.js` — add `GET /slots`
- `frontend/src/App.jsx` — add `/barber` route
- `frontend/src/components/ProtectedRoute.jsx` — accept role array
- `frontend/src/store/authSlice.js` — add `recentBooking` state + `setRecentBooking` action
- `frontend/src/pages/AuthPage.jsx` — barber toggle + redirect after login
- `frontend/src/pages/BookingPage.jsx` — dynamic slots + post-booking recentBooking dispatch
- `frontend/src/pages/HomePage.jsx` — recent booking banner
- `frontend/src/components/ServicesSection.jsx` — fetch from API

---

## Task 1: Schedule Model

**Files:**
- Create: `backend/src/models/Schedule.js`

- [ ] **Step 1: Create the Schedule model**

```js
// backend/src/models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    barber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    workStart:    { type: String, default: '09:00' },
    workEnd:      { type: String, default: '18:00' },
    lunchStart:   { type: String, default: '13:00' },
    lunchEnd:     { type: String, default: '14:00' },
    daysOff:      { type: [Number], default: [0, 6] }, // 0=Sun, 6=Sat
    slotDuration: { type: Number, default: 30 },       // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/models/Schedule.js
git commit -m "feat: add Schedule model"
```

---

## Task 2: Schedule Controller + Routes

**Files:**
- Create: `backend/src/controllers/schedule.controller.js`
- Create: `backend/src/routes/schedule.routes.js`

- [ ] **Step 1: Create schedule controller**

```js
// backend/src/controllers/schedule.controller.js
const Schedule = require('../models/Schedule');

exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ barber: req.params.barberId });
    if (!schedule) return res.json({ schedule: null });
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upsertSchedule = async (req, res) => {
  try {
    const { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration } = req.body;
    const schedule = await Schedule.findOneAndUpdate(
      { barber: req.user._id },
      { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Create schedule routes**

```js
// backend/src/routes/schedule.routes.js
const router = require('express').Router();
const { getSchedule, upsertSchedule } = require('../controllers/schedule.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/:barberId', getSchedule);
router.put('/', protect, authorize('barber', 'admin'), upsertSchedule);

module.exports = router;
```

- [ ] **Step 3: Register routes in app.js**

Open `backend/src/app.js`. After the existing route imports, add:

```js
const scheduleRoutes = require('./routes/schedule.routes');
```

After `app.use('/api/bookings', bookingRoutes);`, add:

```js
app.use('/api/schedule', scheduleRoutes);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/schedule.controller.js backend/src/routes/schedule.routes.js backend/src/app.js
git commit -m "feat: add schedule controller, routes, register in app"
```

---

## Task 3: Auth Controller — Accept role in Register

**Files:**
- Modify: `backend/src/controllers/auth.controller.js`

Current `register` hardcodes `role: 'user'`. Change it to accept `'user'` or `'barber'` from the request body.

- [ ] **Step 1: Update register handler**

Replace the register function body in `backend/src/controllers/auth.controller.js`:

```js
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, role } = req.body;
    const safeRole = role === 'barber' ? 'barber' : 'user'; // admin only via DB

    const exists = await User.findOne({ phoneNumber });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ firstName, lastName, phoneNumber, password, role: safeRole });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, firstName, lastName, phoneNumber, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/auth.controller.js
git commit -m "feat: allow barber role in register endpoint"
```

---

## Task 4: Service Controller — Ownership Check

**Files:**
- Modify: `backend/src/controllers/service.controller.js`

Barbers should only update/delete their own services.

- [ ] **Step 1: Update updateService**

Replace `exports.updateService` in `backend/src/controllers/service.controller.js`:

```js
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (req.user.role === 'barber' && String(service.barber) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, description, price, duration } = req.body;
    Object.assign(service, { name, description, price, duration });
    await service.save();
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Update deleteService**

Replace `exports.deleteService`:

```js
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (req.user.role === 'barber' && String(service.barber) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await service.deleteOne();
    await User.findByIdAndUpdate(service.barber, { $pull: { services: service._id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/service.controller.js
git commit -m "fix: barbers can only edit/delete own services"
```

---

## Task 5: Booking Slots Endpoint

**Files:**
- Modify: `backend/src/controllers/booking.controller.js`
- Modify: `backend/src/routes/booking.routes.js`

- [ ] **Step 1: Add slot generation helper + getAvailableSlots to booking controller**

Add to the top of `backend/src/controllers/booking.controller.js`:

```js
const Schedule = require('../models/Schedule');
```

Add this helper function and export after existing exports:

```js
function generateWeekSlots(schedule, weekStart) {
  const { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration } = schedule;
  const result = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    if (daysOff.includes(dayOfWeek)) {
      result.push({ date: dateStr, slots: [] });
      continue;
    }

    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const start = toMin(workStart);
    const end = toMin(workEnd);
    const ls = toMin(lunchStart);
    const le = toMin(lunchEnd);

    const slots = [];
    let cur = start;
    while (cur + slotDuration <= end) {
      if (cur >= ls && cur < le) { cur = le; continue; }
      slots.push(toStr(cur));
      cur += slotDuration;
    }
    result.push({ date: dateStr, slots });
  }
  return result;
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { barberId, weekStart } = req.query;
    if (!barberId || !weekStart) {
      return res.status(400).json({ message: 'barberId and weekStart required' });
    }

    const schedule = await Schedule.findOne({ barber: barberId });
    if (!schedule) return res.json({ slots: [] });

    const startDate = new Date(weekStart);
    const allSlots = generateWeekSlots(schedule, startDate);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    const endStr = endDate.toISOString().split('T')[0];

    const bookings = await Booking.find({
      barber: barberId,
      date: { $gte: weekStart, $lt: endStr },
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedSet = new Set(bookings.map((b) => `${b.date}|${b.time}`));

    const result = allSlots.map((day) => ({
      date: day.date,
      slots: day.slots.map((time) => ({
        time,
        available: !bookedSet.has(`${day.date}|${time}`),
      })),
    }));

    res.json({ slots: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Register the slots route in booking.routes.js**

Open `backend/src/routes/booking.routes.js`. Add to the imports:

```js
const {
  createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking, getAvailableSlots,
} = require('../controllers/booking.controller');
```

Add before any `/:id` routes (must be first to avoid param conflicts):

```js
router.get('/slots', getAvailableSlots);
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/booking.controller.js backend/src/routes/booking.routes.js
git commit -m "feat: add slot generation and GET /api/bookings/slots endpoint"
```

---

## Task 6: Frontend — ProtectedRoute + App.jsx Routing

**Files:**
- Modify: `frontend/src/components/ProtectedRoute.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Update ProtectedRoute to accept role string or array**

Replace full content of `frontend/src/components/ProtectedRoute.jsx`:

```jsx
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
```

- [ ] **Step 2: Add /barber route in App.jsx**

Open `frontend/src/App.jsx`. Add the import:

```jsx
import BarberDashboard from './pages/BarberDashboard'
```

Add the route inside `<Routes>`, after the `/dashboard` route:

```jsx
<Route
  path="/barber"
  element={
    <ProtectedRoute role="barber">
      <BarberDashboard />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ProtectedRoute.jsx frontend/src/App.jsx
git commit -m "feat: ProtectedRoute supports role array + add /barber route"
```

---

## Task 7: Frontend — authSlice + bookingSlice (recentBooking)

**Files:**
- Modify: `frontend/src/store/authSlice.js`
- Create: `frontend/src/store/bookingSlice.js`

- [ ] **Step 1: Add recentBooking to authSlice**

In `frontend/src/store/authSlice.js`, add `recentBooking: null` to `initialState`:

```js
initialState: {
  user: storedUser,
  token: storedToken,
  loading: false,
  error: null,
  recentBooking: null,
},
```

Add `setRecentBooking` to the `reducers` object:

```js
setRecentBooking(state, action) {
  state.recentBooking = action.payload
},
```

Add `setRecentBooking` to the exports line:

```js
export const { logout, clearError, setRecentBooking } = authSlice.actions
```

- [ ] **Step 2: Create bookingSlice (no separate file needed — recentBooking lives in authSlice. Skip this step.)**

This step is intentionally skipped — `recentBooking` is stored in `authSlice` for simplicity.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/store/authSlice.js
git commit -m "feat: add recentBooking state to authSlice"
```

---

## Task 8: Frontend — AuthPage (barber toggle + redirect)

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`

- [ ] **Step 1: Add barber role toggle to register form state**

In `AuthPage.jsx`, find the register state declarations (around `regFirstName`, etc.) and add:

```jsx
const [isBarber, setIsBarber] = useState(false)
```

- [ ] **Step 2: Update handleRegisterSubmit to send role**

Replace `handleRegisterSubmit`:

```jsx
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
```

- [ ] **Step 3: Update handleLoginSubmit to redirect by role or param**

Replace `handleLoginSubmit`:

```jsx
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
```

- [ ] **Step 4: Add barber toggle UI in register form**

In the register form, add the toggle before the submit button. Find the closing `</div>` of the fields section and add before the submit button:

```jsx
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
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx
git commit -m "feat: barber role toggle in register + redirect after auth"
```

---

## Task 9: Frontend — BarberDashboard (My Services tab)

**Files:**
- Create: `frontend/src/pages/BarberDashboard.jsx`
- Create: `frontend/src/pages/BarberDashboard.module.css`

- [ ] **Step 1: Create the CSS file**

```css
/* frontend/src/pages/BarberDashboard.module.css */
.root { display: flex; min-height: 100vh; background: #0a0a0a; color: #fff; font-family: inherit; }

/* Sidebar */
.sidebar { width: 220px; background: #111; border-right: 1px solid #1e1e1e; display: flex; flex-direction: column; padding: 28px 0; flex-shrink: 0; }
.sidebarLogo { padding: 0 24px 28px; font-size: 18px; font-weight: 700; letter-spacing: 0.04em; color: #c9a96e; border-bottom: 1px solid #1e1e1e; margin-bottom: 16px; }
.navBtn { display: flex; align-items: center; gap: 10px; padding: 11px 24px; background: none; border: none; color: #888; font-size: 14px; cursor: pointer; width: 100%; text-align: left; transition: color 0.15s, background 0.15s; }
.navBtn:hover { color: #fff; background: #1a1a1a; }
.navActive { color: #fff !important; background: #1a1a1a !important; border-left: 2px solid #c9a96e; }
.navIcon { width: 16px; height: 16px; flex-shrink: 0; }

/* Main */
.main { flex: 1; padding: 36px 40px; overflow-y: auto; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.headerTitle { font-size: 22px; font-weight: 700; }
.headerSub { font-size: 13px; color: #666; margin-top: 3px; }
.logoutBtn { background: none; border: 1px solid #333; color: #888; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: color 0.15s, border-color 0.15s; }
.logoutBtn:hover { color: #fff; border-color: #555; }

/* Section */
.sectionHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.sectionTitle { font-size: 17px; font-weight: 600; }
.addBtn { background: #c9a96e; color: #000; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.addBtn:hover { opacity: 0.85; }

/* Table */
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #555; border-bottom: 1px solid #1e1e1e; }
.table td { padding: 14px; font-size: 14px; border-bottom: 1px solid #111; color: #ccc; }
.table tr:hover td { background: #111; }
.actionBtn { background: none; border: 1px solid #333; color: #888; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 6px; transition: color 0.15s, border-color 0.15s; }
.actionBtn:hover { color: #fff; border-color: #555; }
.deleteBtn { border-color: #3a1a1a; color: #c94a4a; }
.deleteBtn:hover { border-color: #c94a4a; color: #ef4444; background: rgba(239,68,68,0.06); }

/* Modal */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; padding: 28px; width: 420px; max-width: 95vw; }
.modalTitle { font-size: 17px; font-weight: 600; margin-bottom: 20px; }
.field { margin-bottom: 16px; }
.label { display: block; font-size: 12px; color: #888; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.input { width: 100%; background: #0a0a0a; border: 1px solid #222; color: #fff; padding: 10px 12px; border-radius: 7px; font-size: 14px; box-sizing: border-box; }
.input:focus { outline: none; border-color: #c9a96e; }
.modalBtns { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
.cancelBtn { background: none; border: 1px solid #333; color: #888; padding: 9px 18px; border-radius: 6px; font-size: 13px; cursor: pointer; }
.saveBtn { background: #c9a96e; color: #000; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }

/* Schedule */
.scheduleGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 520px; }
.daysGrid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.dayToggle { padding: 7px 13px; border-radius: 6px; border: 1px solid #333; background: none; color: #888; font-size: 13px; cursor: pointer; transition: all 0.15s; }
.dayToggleActive { background: #c9a96e; color: #000; border-color: #c9a96e; font-weight: 600; }
.saveScheduleBtn { margin-top: 24px; background: #c9a96e; color: #000; border: none; padding: 10px 24px; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; }
.select { width: 100%; background: #0a0a0a; border: 1px solid #222; color: #fff; padding: 10px 12px; border-radius: 7px; font-size: 14px; }

/* Clients */
.statusChip { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.statusPending  { background: rgba(201,169,110,0.15); color: #c9a96e; }
.statusConfirmed { background: rgba(34,197,94,0.12); color: #22c55e; }
.statusCompleted { background: rgba(99,102,241,0.15); color: #818cf8; }
.statusCancelled { background: rgba(239,68,68,0.1); color: #ef4444; }

.empty { color: #555; font-size: 14px; padding: 32px 0; text-align: center; }
.loading { color: #555; font-size: 14px; padding: 32px 0; text-align: center; }
```

- [ ] **Step 2: Create BarberDashboard.jsx with services tab**

```jsx
// frontend/src/pages/BarberDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import api from '../lib/api'
import styles from './BarberDashboard.module.css'

const DAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

// ── Icons ──────────────────────────────────────────────────────────────────
const IconScissors = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)
const IconCalendar = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconUsers = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

// ── Service Modal ──────────────────────────────────────────────────────────
function ServiceModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || { name: '', description: '', price: '', duration: '' }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTitle}>{initial ? 'Serviceni tahrirlash' : 'Yangi service'}</div>
        <div className={styles.field}>
          <label className={styles.label}>Nomi</label>
          <input className={styles.input} value={form.name} onChange={set('name')} placeholder="Soch olish" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Tavsif</label>
          <input className={styles.input} value={form.description} onChange={set('description')} placeholder="Qisqa tavsif" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Narx (so'm)</label>
          <input className={styles.input} type="number" value={form.price} onChange={set('price')} placeholder="30000" min={0} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Davomiyligi (daqiqa)</label>
          <input className={styles.input} type="number" value={form.duration} onChange={set('duration')} placeholder="30" min={5} required />
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.cancelBtn} onClick={onClose}>Bekor</button>
          <button className={styles.saveBtn} onClick={() => onSave(form)}>Saqlash</button>
        </div>
      </div>
    </div>
  )
}

// ── My Services Tab ────────────────────────────────────────────────────────
function MyServicesTab({ barberId }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | service object

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/services?barberId=${barberId}`)
      setServices(res.data.services)
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [barberId])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleSave = async (form) => {
    try {
      if (modal && modal._id) {
        await api.put(`/services/${modal._id}`, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          duration: Number(form.duration),
        })
      } else {
        await api.post('/services', {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          duration: Number(form.duration),
        })
      }
      setModal(null)
      fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Serviceni o\'chirasizmi?')) return
    try {
      await api.delete(`/services/${id}`)
      fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik')
    }
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Mening xizmatlarim</div>
        <button className={styles.addBtn} onClick={() => setModal('add')}>+ Qo'shish</button>
      </div>

      {loading ? (
        <div className={styles.loading}>Yuklanmoqda…</div>
      ) : services.length === 0 ? (
        <div className={styles.empty}>Hali xizmat qo'shilmagan</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nomi</th><th>Davomiyligi</th><th>Narxi</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.duration} daq</td>
                <td>{Number(s.price).toLocaleString()} so'm</td>
                <td>
                  <button className={styles.actionBtn} onClick={() => setModal(s)}>Tahrirlash</button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(s._id)}>O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <ServiceModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

// ── My Schedule Tab ────────────────────────────────────────────────────────
function MyScheduleTab({ barberId }) {
  const [form, setForm] = useState({
    workStart: '09:00', workEnd: '18:00',
    lunchStart: '13:00', lunchEnd: '14:00',
    daysOff: [0, 6], slotDuration: 30,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/schedule/${barberId}`)
      .then((res) => { if (res.data.schedule) setForm(res.data.schedule) })
      .finally(() => setLoading(false))
  }, [barberId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleDay = (idx) => {
    setForm((f) => ({
      ...f,
      daysOff: f.daysOff.includes(idx)
        ? f.daysOff.filter((d) => d !== idx)
        : [...f.daysOff, idx],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/schedule', { ...form, slotDuration: Number(form.slotDuration) })
      alert('Jadval saqlandi!')
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.loading}>Yuklanmoqda…</div>

  return (
    <>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Ish jadvali</div>
      </div>

      <div className={styles.scheduleGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Ish boshlanish vaqti</label>
          <input type="time" className={styles.input} value={form.workStart} onChange={set('workStart')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Ish tugash vaqti</label>
          <input type="time" className={styles.input} value={form.workEnd} onChange={set('workEnd')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Tushlik boshlanishi</label>
          <input type="time" className={styles.input} value={form.lunchStart} onChange={set('lunchStart')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Tushlik tugashi</label>
          <input type="time" className={styles.input} value={form.lunchEnd} onChange={set('lunchEnd')} />
        </div>
      </div>

      <div className={styles.field} style={{ marginTop: 8 }}>
        <label className={styles.label}>Slot davomiyligi</label>
        <select className={styles.select} value={form.slotDuration} onChange={set('slotDuration')}>
          <option value={15}>15 daqiqa</option>
          <option value={30}>30 daqiqa</option>
          <option value={45}>45 daqiqa</option>
          <option value={60}>60 daqiqa</option>
        </select>
      </div>

      <div className={styles.field} style={{ marginTop: 8 }}>
        <label className={styles.label}>Dam olish kunlari (bosib belgilang)</label>
        <div className={styles.daysGrid}>
          {DAYS.map((d, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.dayToggle} ${form.daysOff.includes(idx) ? styles.dayToggleActive : ''}`}
              onClick={() => toggleDay(idx)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.saveScheduleBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Saqlanmoqda…' : 'Jadalni saqlash'}
      </button>
    </>
  )
}

// ── My Clients Tab ─────────────────────────────────────────────────────────
function MyClientsTab() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.bookings)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status })
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik')
    }
  }

  const statusClass = {
    pending:   styles.statusPending,
    confirmed: styles.statusConfirmed,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Mening mijozlarim</div>
      </div>

      {loading ? (
        <div className={styles.loading}>Yuklanmoqda…</div>
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>Hali buyurtma yo'q</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Mijoz</th><th>Xizmat</th><th>Sana</th><th>Vaqt</th><th>Holati</th><th>Amal</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.firstName} {b.user?.lastName}</td>
                <td>{b.service?.name}</td>
                <td>{b.date}</td>
                <td>{b.time}</td>
                <td>
                  <span className={`${styles.statusChip} ${statusClass[b.status] || ''}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === 'pending' && (
                    <button className={styles.actionBtn} onClick={() => updateStatus(b._id, 'confirmed')}>Tasdiqlash</button>
                  )}
                  {b.status === 'confirmed' && (
                    <button className={styles.actionBtn} onClick={() => updateStatus(b._id, 'completed')}>Tugallandi</button>
                  )}
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => updateStatus(b._id, 'cancelled')}>Bekor</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const NAV = [
  { key: 'services', label: 'Xizmatlarim', Icon: IconScissors },
  { key: 'schedule', label: 'Ish jadvali', Icon: IconCalendar },
  { key: 'clients',  label: 'Mijozlarim',  Icon: IconUsers },
]

export default function BarberDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [tab, setTab] = useState('services')

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>✂ BarberPro</div>
        {NAV.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`${styles.navBtn} ${tab === key ? styles.navActive : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon /> {label}
          </button>
        ))}
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>Barber Panel</div>
            <div className={styles.headerSub}>{user?.firstName} {user?.lastName}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Chiqish</button>
        </div>

        {tab === 'services' && <MyServicesTab barberId={user?._id || user?.id} />}
        {tab === 'schedule' && <MyScheduleTab barberId={user?._id || user?.id} />}
        {tab === 'clients'  && <MyClientsTab />}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BarberDashboard.jsx frontend/src/pages/BarberDashboard.module.css
git commit -m "feat: BarberDashboard with Services, Schedule, and Clients tabs"
```

---

## Task 10: Backend — Filter Services by barberId

The `getAllServices` endpoint needs to support `?barberId=X` query param.

**Files:**
- Modify: `backend/src/controllers/service.controller.js`

- [ ] **Step 1: Update getAllServices to accept barberId filter**

Replace `exports.getAllServices`:

```js
exports.getAllServices = async (req, res) => {
  try {
    const filter = req.query.barberId ? { barber: req.query.barberId } : {};
    const services = await Service.find(filter).populate('barber', 'firstName lastName phoneNumber');
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/service.controller.js
git commit -m "feat: support ?barberId filter in GET /api/services"
```

---

## Task 11: Frontend — BookingPage Dynamic Slots

**Files:**
- Modify: `frontend/src/pages/BookingPage.jsx`

Replace the fake `seedBooked` logic with real API calls. The key changes:
1. After barber is selected, fetch `GET /api/schedule/:barberId` to get work hours
2. Fetch `GET /api/bookings/slots?barberId=X&weekStart=YYYY-MM-DD` when week changes
3. Generate slot grid from real schedule
4. After booking confirmed, dispatch `setRecentBooking`

- [ ] **Step 1: Add schedule + slots state and fetching**

At the top of `BookingPage.jsx`, add these imports:

```jsx
import { useDispatch } from 'react-redux'
import { setRecentBooking } from '../store/authSlice'
```

Add these state variables inside the component (alongside existing ones):

```jsx
const dispatch = useDispatch()
const [schedule, setSchedule] = useState(null)
const [slotsData, setSlotsData] = useState([]) // [{date, slots:[{time, available}]}]
const [loadingSlots, setLoadingSlots] = useState(false)
```

- [ ] **Step 2: Fetch schedule when barber selected**

Add this effect after the existing data-fetch effect:

```jsx
useEffect(() => {
  if (!selectedBarber) { setSchedule(null); setSlotsData([]); return }
  api.get(`/schedule/${selectedBarber._id}`).then((res) => {
    setSchedule(res.data.schedule)
  }).catch(() => setSchedule(null))
}, [selectedBarber])
```

- [ ] **Step 3: Fetch real slots when barber or weekOffset changes**

Add this effect:

```jsx
useEffect(() => {
  if (!selectedBarber) return
  setLoadingSlots(true)
  setSelectedSlot(null)
  const weekStart = getWeekDates(weekOffset)[0]
  const weekStartStr = weekStart.toISOString().split('T')[0]
  api.get(`/bookings/slots?barberId=${selectedBarber._id}&weekStart=${weekStartStr}`)
    .then((res) => setSlotsData(res.data.slots || []))
    .catch(() => setSlotsData([]))
    .finally(() => setLoadingSlots(false))
}, [selectedBarber, weekOffset])
```

- [ ] **Step 4: Replace slot rendering logic**

Remove the `HOURS`, `bookedSlots` (seedBooked), and old grid rendering. Replace with real data.

Replace `const HOURS = [...]` and `const bookedSlots = useMemo(...)` with:

```jsx
// Build a lookup: "YYYY-MM-DD|HH:MM" -> available bool
const slotMap = useMemo(() => {
  const m = {}
  slotsData.forEach(({ date, slots }) => {
    slots.forEach(({ time, available }) => { m[`${date}|${time}`] = available })
  })
  return m
}, [slotsData])

// Unique time labels across all days (sorted)
const timeLabels = useMemo(() => {
  const set = new Set()
  slotsData.forEach(({ slots }) => slots.forEach(({ time }) => set.add(time)))
  return [...set].sort()
}, [slotsData])
```

- [ ] **Step 5: Update the grid rendering to use real data**

In the JSX grid section, replace the HOURS.map + bookedSlots logic with:

```jsx
{timeLabels.length === 0 && !loadingSlots && selectedBarber && (
  <div style={{ color: '#555', padding: '24px', gridColumn: '1/-1' }}>
    {schedule ? 'Bu hafta ish vaqti yo\'q' : 'Jadval hali sozlanmagan'}
  </div>
)}
{loadingSlots && (
  <div style={{ color: '#555', padding: '24px', gridColumn: '1/-1' }}>Yuklanmoqda…</div>
)}
{timeLabels.map((time, hi) => (
  <>
    <div key={`h-${hi}`} className={styles.timeLabel}>{time}</div>
    {weekDates.map((date, di) => {
      const dateStr = date.toISOString().split('T')[0]
      const key = `${dateStr}|${time}`
      const available = slotMap[key]
      const inMap = key in slotMap
      const past = date < today || (date.toDateString() === today.toDateString() && parseInt(time) < new Date().getHours())
      const isSelected = selectedSlot?.dateStr === dateStr && selectedSlot?.time === time
      const isToday = date.toDateString() === new Date().toDateString()
      const disabled = !inMap || !available || past || !selectedBarber

      return (
        <button
          key={key}
          className={[
            styles.slot,
            !inMap ? styles.slotDisabled : '',
            inMap && !available ? styles.slotBooked : '',
            past ? styles.slotPast : '',
            isSelected ? styles.slotSelected : '',
            isToday ? styles.slotToday : '',
            inMap && available && !past ? styles.slotAvailable : '',
          ].join(' ')}
          onClick={() => !disabled && setSelectedSlot({ dateStr, time })}
          disabled={disabled}
        >
          {inMap && !available && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          {isSelected && available && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
      )
    })}
  </>
))}
```

- [ ] **Step 6: Update selectedSlot shape and booking submit**

`selectedSlot` now stores `{ dateStr, time }` instead of `{ di, hi }`. Update `slotLabel`:

```jsx
const slotLabel = selectedSlot
  ? `${new Date(selectedSlot.dateStr).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric', month: 'short' })}, ${selectedSlot.time}`
  : null
```

Update `canConfirm`:

```jsx
const canConfirm = selectedService && selectedBarber && selectedSlot && !submitLoading
```

Update the booking submit handler:

```jsx
const handleConfirm = async () => {
  if (!canConfirm) return
  setSubmitLoading(true)
  setSubmitError(null)
  try {
    const res = await api.post('/bookings', {
      barber: selectedBarber._id,
      service: selectedService._id,
      date: selectedSlot.dateStr,
      time: selectedSlot.time,
      notes: '',
    })
    dispatch(setRecentBooking({
      barberName: `${selectedBarber.firstName} ${selectedBarber.lastName}`,
      date: selectedSlot.dateStr,
      time: selectedSlot.time,
      service: selectedService.name,
    }))
    setConfirmed(true)
  } catch (err) {
    setSubmitError(err.response?.data?.message || 'Xatolik yuz berdi')
  } finally {
    setSubmitLoading(false)
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/BookingPage.jsx
git commit -m "feat: BookingPage uses real schedule/slots from API"
```

---

## Task 12: Frontend — HomePage Recent Booking Banner

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Read recentBooking from Redux and show banner**

In `HomePage.jsx`, add imports:

```jsx
import { useSelector, useDispatch } from 'react-redux'
import { setRecentBooking } from '../store/authSlice'
```

Inside the component, add:

```jsx
const dispatch = useDispatch()
const recentBooking = useSelector((s) => s.auth.recentBooking)
```

Add banner JSX at the very top of the returned JSX (before any existing content):

```jsx
{recentBooking && (
  <div style={{
    background: 'linear-gradient(90deg, rgba(201,169,110,0.12), rgba(201,169,110,0.06))',
    border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: '10px',
    padding: '14px 20px',
    margin: '20px 24px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  }}>
    <span style={{ color: '#c9a96e', fontSize: '14px' }}>
      ✓ <strong>{recentBooking.barberName}</strong> ga {recentBooking.date} kuni {recentBooking.time} da yozildingiz — <em>{recentBooking.service}</em>
    </span>
    <button
      onClick={() => dispatch(setRecentBooking(null))}
      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
    >×</button>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: show recent booking confirmation banner on HomePage"
```

---

## Task 13: Frontend — ServicesSection Fetch from API

**Files:**
- Modify: `frontend/src/components/ServicesSection.jsx`

- [ ] **Step 1: Read current ServicesSection**

Read `frontend/src/components/ServicesSection.jsx` to see what static data it uses.

- [ ] **Step 2: Replace static data with API fetch**

At the top of `ServicesSection.jsx`, add:

```jsx
import { useState, useEffect } from 'react'
import api from '../lib/api'
```

Inside the component, replace any static services array with:

```jsx
const [services, setServices] = useState([])
useEffect(() => {
  api.get('/services').then((res) => setServices(res.data.services)).catch(() => {})
}, [])
```

Use `services` array in the render instead of the static data.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ServicesSection.jsx
git commit -m "feat: ServicesSection fetches services from API"
```

---

## Task 14: Backend — Fix booking authorize for user role

Currently `createBooking` only allows role `user`, but after login redirect the user with role `user` hits the booking endpoint. Verify this is correct (it is — barbers don't book, users do). No change needed.

However, verify the booking slots route doesn't require auth (it's public for the calendar display):

- [ ] **Step 1: Confirm `/slots` is public in booking.routes.js**

The `router.get('/slots', getAvailableSlots)` line has no `protect` middleware — this is correct.

- [ ] **Step 2: Final integration test**

Start both servers:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

Manual test checklist:
1. Register as barber → redirected to `/barber`
2. In `/barber` → Services tab → Add service → appears in table
3. In `/barber` → Schedule tab → Set 9:00–18:00, lunch 13:00–14:00, days off Sat/Sun → Save
4. Log out → go to `/` → click Book on any service → redirected to `/auth?redirect=...`
5. Log in as user → redirected back to `/booking`
6. In booking: select service → barbers offering it shown → select barber → real slot grid appears
7. Pick a slot → confirm → redirected to `/` → booking banner shows

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete barbershop platform — auth redirect, barber dashboard, real schedule/slots"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Auth redirect flow (Tasks 6, 8, 11)
- ✅ Barber registration toggle (Task 8)
- ✅ Schedule model + endpoints (Tasks 1, 2)
- ✅ Service CRUD with ownership (Tasks 4, 9, 10)
- ✅ Slot generation from schedule (Task 5)
- ✅ Barber dashboard (Task 9 — Services, Schedule, Clients)
- ✅ Dynamic BookingPage (Task 11)
- ✅ recentBooking banner (Tasks 7, 12)
- ✅ ServicesSection from API (Task 13)

**Type consistency:**
- `selectedSlot` shape changed to `{ dateStr, time }` consistently in Tasks 11 steps 5 and 6
- `setRecentBooking` exported from authSlice (Task 7) and imported in Tasks 11, 12
- `getAvailableSlots` exported from booking.controller (Task 5) and imported in booking.routes (Task 5 Step 2)
