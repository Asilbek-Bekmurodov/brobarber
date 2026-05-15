import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../lib/api'
import styles from './BookingPage.module.css'

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

  const [selectedService, setSelectedService] = useState(null)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

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
        const fetchedServices = servicesRes.data.services
        setServices(fetchedServices)
        setBarbers(barbersRes.data.barbers)

        // Restore initial service from query param after data loads
        const serviceParam = searchParams.get('service')
        if (serviceParam) {
          const match = fetchedServices.find(s => s.name === serviceParam)
          if (match) setSelectedService(match)
        }
      } catch (err) {
        console.error('Failed to load booking data:', err)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

  const bookedSlots = useMemo(
    () => (selectedBarber ? seedBooked(selectedBarber._id, weekOffset) : new Set()),
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

  if (loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#888', fontSize: '14px' }}>
        Loading…
      </div>
    )
  }

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
              <span className={styles.confirmedValue}>{selectedService.name}</span>
            </div>
            <div className={styles.confirmedDivider} />
            <div className={styles.confirmedRow}>
              <span className={styles.confirmedLabel}>Barber</span>
              <span className={styles.confirmedValue}>{selectedBarber.firstName} {selectedBarber.lastName}</span>
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
            {services.map(service => (
              <button
                key={service._id}
                className={`${styles.serviceChip} ${selectedService?._id === service._id ? styles.serviceChipActive : ''}`}
                onClick={() => { setSelectedService(service); setSelectedSlot(null) }}
              >
                <span className={styles.chipIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                </span>
                <span className={styles.chipInfo}>
                  <span className={styles.chipTitle}>{service.name}</span>
                  <span className={styles.chipPrice}>{`$${service.price}`}</span>
                </span>
                {selectedService?._id === service._id && (
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
            {barbers.map(barber => (
              <button
                key={barber._id}
                className={`${styles.barberCard} ${selectedBarber?._id === barber._id ? styles.barberCardActive : ''} ${!selectedService ? styles.barberCardDisabled : ''}`}
                onClick={() => { if (selectedService) { setSelectedBarber(barber); setSelectedSlot(null) } }}
                disabled={!selectedService}
              >
                <div className={styles.barberAvatarWrap}>
                  <div className={styles.barberAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#888', fontSize: '22px', fontWeight: 600 }}>
                    {barber.firstName?.[0]}{barber.lastName?.[0]}
                  </div>
                  {selectedBarber?._id === barber._id && (
                    <span className={styles.barberCheck}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className={styles.barberName}>{`${barber.firstName} ${barber.lastName}`}</span>
                <span className={styles.barberRole}>{barber.role}</span>
                <span className={styles.barberSpec}>{barber.bio || 'Professional Barber'}</span>
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
                <span className={styles.summaryIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                </span>
                {selectedService.name}
              </span>
            )}
            {selectedBarber && (
              <>
                <span className={styles.summarySep}>·</span>
                <span className={styles.summaryItem}>{selectedBarber.firstName} {selectedBarber.lastName}</span>
              </>
            )}
            {slotLabel && (
              <>
                <span className={styles.summarySep}>·</span>
                <span className={styles.summaryItem}>{slotLabel}</span>
              </>
            )}
          </div>
          {submitError && (
            <span style={{ color: '#ef4444', fontSize: '12px', marginRight: '12px' }}>{submitError}</span>
          )}
          <button
            className={styles.confirmBtn}
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
            disabled={!canConfirm}
          >
            {submitLoading ? 'Confirming…' : 'Confirm Booking'}
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
