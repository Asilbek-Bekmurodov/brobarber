import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import styles from './BookingPage.module.css'

const SERVICES = [
  {
    id: '01',
    title: 'Haircuts',
    price: 'From $25',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: '02',
    title: 'Beard & Shaving',
    price: 'From $20',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2h10l2 6H5L7 2z" /><path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    id: '03',
    title: 'Hair Coloring',
    price: 'From $75',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
        <path d="M22 22l-5-5" /><path d="M17 22l5-5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: '04',
    title: 'Hair Treatments',
    price: 'From $35',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: '05',
    title: 'Luxury Packages',
    price: 'From $120',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]

const BARBERS = [
  {
    id: 'james-wilson',
    name: 'James Wilson',
    role: 'Master Barber',
    specialty: 'Classic Cuts & Hot Towel Shaves',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
  {
    id: 'marcus-reed',
    name: 'Marcus Reed',
    role: 'Senior Barber',
    specialty: 'Fades, Tapers & Beard Design',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
  {
    id: 'daniel-hayes',
    name: 'Daniel Hayes',
    role: 'Color Specialist',
    specialty: 'Color, Highlights & Treatments',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
  {
    id: 'elijah-cross',
    name: 'Elijah Cross',
    role: 'Junior Barber',
    specialty: 'Modern Cuts & Grooming',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
]

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 8
  return `${String(h).padStart(2, '0')}:00`
})

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(weekOffset) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function seedBooked(barberId, weekOffset) {
  const booked = new Set()
  const seed = barberId.charCodeAt(0) + weekOffset * 7
  DAYS_SHORT.forEach((_, di) => {
    HOURS.forEach((h, hi) => {
      const hash = ((seed * 31 + di * 17 + hi * 7) * 2654435761) >>> 0
      if (hash % 3 === 0) booked.add(`${di}-${hi}`)
    })
  })
  return booked
}

const BookingPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialService = SERVICES.find(s => s.title === searchParams.get('service')) || null

  const [selectedService, setSelectedService] = useState(initialService)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

  const bookedSlots = useMemo(
    () => (selectedBarber ? seedBooked(selectedBarber.id, weekOffset) : new Set()),
    [selectedBarber, weekOffset]
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekLabel = (() => {
    const fmt = (d) =>
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${fmt(weekDates[0])} – ${fmt(weekDates[6])} ${weekDates[0].getFullYear()}`
  })()

  const isPast = (date, hourIdx) => {
    const slot = new Date(date)
    slot.setHours(8 + hourIdx, 0, 0, 0)
    return slot < new Date()
  }

  const slotLabel = (() => {
    if (!selectedSlot) return null
    const { di, hi } = selectedSlot
    const d = weekDates[di]
    return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${HOURS[hi]}`
  })()

  const canConfirm = selectedService && selectedBarber && selectedSlot

  if (confirmed) {
    return (
      <div className={styles.confirmedPage}>
        <div className={styles.confirmedCard}>
          <div className={styles.confirmedIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.confirmedSeps}>
            <span className={styles.sepLine} /><span className={styles.diamond} /><span className={styles.diamond} /><span className={styles.diamond} /><span className={styles.sepLine} />
          </div>
          <h2 className={styles.confirmedTitle}>Booking Confirmed</h2>
          <p className={styles.confirmedSub}>Your appointment has been reserved.</p>
          <div className={styles.confirmedDetails}>
            <div className={styles.confirmedRow}>
              <span className={styles.confirmedLabel}>Service</span>
              <span className={styles.confirmedValue}>{selectedService.title}</span>
            </div>
            <div className={styles.confirmedDivider} />
            <div className={styles.confirmedRow}>
              <span className={styles.confirmedLabel}>Barber</span>
              <span className={styles.confirmedValue}>{selectedBarber.name}</span>
            </div>
            <div className={styles.confirmedDivider} />
            <div className={styles.confirmedRow}>
              <span className={styles.confirmedLabel}>Time</span>
              <span className={styles.confirmedValue}>{slotLabel}</span>
            </div>
          </div>
          <Link to="/" className={styles.confirmedBtn}>Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.eyebrow}>BroBarbershop</span>
          <div className={styles.seps}>
            <span className={styles.sepLine} /><span className={styles.diamond} /><span className={styles.diamond} /><span className={styles.diamond} /><span className={styles.sepLine} />
          </div>
          <h1 className={styles.title}>Book Appointment</h1>
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Step 1: Service ── */}
        <section className={styles.step}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNumber}>01</span>
            <span className={styles.stepTitle}>Choose Service</span>
          </div>
          <div className={styles.serviceScroll}>
            {SERVICES.map(service => (
              <button
                key={service.id}
                className={`${styles.serviceChip} ${selectedService?.id === service.id ? styles.serviceChipActive : ''}`}
                onClick={() => { setSelectedService(service); setSelectedSlot(null) }}
              >
                <span className={styles.chipIcon}>{service.icon}</span>
                <span className={styles.chipInfo}>
                  <span className={styles.chipTitle}>{service.title}</span>
                  <span className={styles.chipPrice}>{service.price}</span>
                </span>
                {selectedService?.id === service.id && (
                  <span className={styles.chipCheck}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Step 2: Barber ── */}
        <section className={`${styles.step} ${!selectedService ? styles.stepLocked : ''}`}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNumber}>02</span>
            <span className={styles.stepTitle}>Choose Your Barber</span>
          </div>
          <div className={styles.barberGrid}>
            {BARBERS.map(barber => (
              <button
                key={barber.id}
                className={`${styles.barberCard} ${selectedBarber?.id === barber.id ? styles.barberCardActive : ''} ${!selectedService ? styles.barberCardDisabled : ''}`}
                onClick={() => { if (selectedService) { setSelectedBarber(barber); setSelectedSlot(null) } }}
                disabled={!selectedService}
              >
                <div className={styles.barberAvatarWrap}>
                  <img src={barber.image} alt={barber.name} className={styles.barberAvatar} />
                  {selectedBarber?.id === barber.id && (
                    <span className={styles.barberCheck}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className={styles.barberName}>{barber.name}</span>
                <span className={styles.barberRole}>{barber.role}</span>
                <span className={styles.barberSpec}>{barber.specialty}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Step 3: Schedule ── */}
        <section className={`${styles.step} ${!selectedBarber ? styles.stepLocked : ''}`}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNumber}>03</span>
            <span className={styles.stepTitle}>Pick Date &amp; Time</span>
          </div>

          {/* Week nav */}
          <div className={styles.weekNav}>
            <button
              className={styles.weekArrow}
              onClick={() => { setWeekOffset(o => o - 1); setSelectedSlot(null) }}
              disabled={weekOffset === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <span className={styles.weekLabel}>{weekLabel}</span>
            <button
              className={styles.weekArrow}
              onClick={() => { setWeekOffset(o => o + 1); setSelectedSlot(null) }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Grid */}
          <div className={styles.gridWrap}>
            <div className={styles.grid}>
              {/* Corner */}
              <div className={styles.gridCorner} />
              {/* Day headers */}
              {weekDates.map((date, di) => {
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div key={di} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
                    <span className={styles.dayName}>{DAYS_SHORT[di]}</span>
                    <span className={styles.dayNum}>{date.getDate()}</span>
                  </div>
                )
              })}

              {/* Time rows */}
              {HOURS.map((hour, hi) => (
                <>
                  <div key={`h-${hi}`} className={styles.timeLabel}>{hour}</div>
                  {weekDates.map((date, di) => {
                    const key = `${di}-${hi}`
                    const isBooked = bookedSlots.has(key) && selectedBarber
                    const past = isPast(date, hi)
                    const isSelected = selectedSlot?.di === di && selectedSlot?.hi === hi
                    const isToday = date.toDateString() === new Date().toDateString()
                    const disabled = isBooked || past || !selectedBarber

                    return (
                      <button
                        key={key}
                        className={[
                          styles.slot,
                          isBooked ? styles.slotBooked : '',
                          past ? styles.slotPast : '',
                          isSelected ? styles.slotSelected : '',
                          isToday ? styles.slotToday : '',
                          disabled ? styles.slotDisabled : styles.slotAvailable,
                        ].join(' ')}
                        onClick={() => !disabled && setSelectedSlot({ di, hi })}
                        disabled={disabled}
                        title={isBooked ? 'Already booked' : past ? 'Past time' : `${DAYS_SHORT[di]} ${hour}`}
                      >
                        {isBooked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                        {isSelected && !isBooked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendAvailable}`} />Available</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendBooked}`} />Booked</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendSelected}`} />Your pick</span>
          </div>
        </section>

      </div>

      {/* ── Sticky bottom bar ── */}
      <div className={`${styles.summaryBar} ${canConfirm ? styles.summaryBarVisible : ''}`}>
        <div className={styles.summaryInner}>
          <div className={styles.summaryDetails}>
            {selectedService && (
              <span className={styles.summaryItem}>
                <span className={styles.summaryIcon}>{selectedService.icon}</span>
                {selectedService.title}
              </span>
            )}
            {selectedBarber && (
              <>
                <span className={styles.summarySep}>·</span>
                <span className={styles.summaryItem}>{selectedBarber.name}</span>
              </>
            )}
            {slotLabel && (
              <>
                <span className={styles.summarySep}>·</span>
                <span className={styles.summaryItem}>{slotLabel}</span>
              </>
            )}
          </div>
          <button
            className={styles.confirmBtn}
            onClick={() => canConfirm && setConfirmed(true)}
            disabled={!canConfirm}
          >
            Confirm Booking
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}

export default BookingPage
