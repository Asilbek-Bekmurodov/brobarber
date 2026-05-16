# Barbershop Full Platform Design
Date: 2026-05-17

## Overview
Complete feature expansion: auth-gated booking flow, barber self-registration + dashboard (services CRUD, schedule builder, clients), dynamic schedule/slot system replacing fake data, backend Schedule model.

## 1. Auth Redirect Flow
- Unauthenticated user clicks Book → `navigate('/auth?redirect=/booking&barberId=X&serviceId=Y')`
- AuthPage reads `redirect` param → after successful login/register → navigates to redirect URL
- Confirmed booking → stores `recentBooking` in Redux state → HomePage banner: "✓ [BarberName] ga [Date] [Time] da yozildingiz"
- No redirect param → role-based default: barber→`/barber`, user→`/`

## 2. Barber Registration
- Register form adds "Men barber sifatida ro'yxatdan o'taman" toggle
- Sends `role: 'barber'` to API
- Backend accepts `role: 'user' | 'barber'` in register (admin only via DB)
- After barber register/login → navigate to `/barber`

## 3. Backend Changes

### New: Schedule Model
```
Schedule {
  barber: ObjectId → User (unique)
  workStart: String      // "09:00"
  workEnd: String        // "18:00"
  lunchStart: String     // "13:00"
  lunchEnd: String       // "14:00"
  daysOff: [Number]      // 0=Sun…6=Sat
  slotDuration: Number   // minutes, default 30
}
```

### Schedule Endpoints
```
GET  /api/schedule/:barberId   → public, get barber schedule
PUT  /api/schedule             → barber auth, upsert own schedule
```

### Service CRUD (extended)
```
POST   /api/services           → barber auth, create own service
PUT    /api/services/:id       → barber auth, own service only
DELETE /api/services/:id       → barber auth, own service only
GET    /api/services           → public (existing)
GET    /api/services?barberId  → filter by barber (existing or add)
```

### Booking Slots Endpoint (new)
```
GET /api/bookings/slots?barberId=X&weekStart=2026-05-18
→ Returns: { date: "2026-05-20", slots: [{time:"09:00", available:true}, ...] }[]
Logic: generate slots from Schedule, mark booked from Booking collection
```

## 4. Barber Dashboard (`/barber`) — ProtectedRoute role="barber"

### Tabs
**My Services**
- Table: Name | Duration | Price | Actions
- Add/Edit modal: name, description, price (UZS), duration (min)
- Delete with confirm

**My Schedule**
- Work hours: start/end time pickers
- Lunch break: start/end time pickers
- Days off: 7-day toggle grid (UZ day names)
- Slot duration: 30/45/60 min selector
- Save → PUT /api/schedule
- Live preview: mini slot grid

**My Clients**
- List: Client name | Service | Date | Time | Status chip
- Status update: pending→confirmed→completed | cancel button

## 5. Booking Page (dynamic)
- Service select → shows only barbers offering that service
- Barber select → fetches real schedule from `/api/schedule/:barberId`
- Slot grid generated from schedule (work hours, lunch blocked, days off greyed)
- Available/booked from `/api/bookings/slots`
- Book → if not auth → redirect flow (section 1)

## 6. Homepage Services Section
- `ServicesSection` fetches `GET /api/services` (all or distinct by name)
- Replace static data in `frontend/src/data/barbers.js` usage

## 7. Routing
```
/barber     → ProtectedRoute role="barber" → BarberDashboard (new page)
/           → HomePage (recentBooking banner if state exists)
/booking    → ProtectedRoute (any auth) → BookingPage (updated)
/dashboard  → ProtectedRoute role="admin" → DashboardPage (unchanged)
```

ProtectedRoute updated: `role` prop accepts string or array.

## Design Style
- Follows existing dark theme (CSS Modules, black/white/gold accent)
- Same card/table/modal patterns as DashboardPage
- Consistent with AuthPage form style for modals
