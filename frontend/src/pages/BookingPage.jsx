import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../lib/api'
import styles from './BookingPage.module.css'
import { setRecentBooking } from '../store/authSlice'

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

const BookingPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

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

  const [schedule, setSchedule] = useState(null)
  const [slotsData, setSlotsData] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

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

  useEffect(() => {
    if (!selectedBarber) { setSchedule(null); setSlotsData([]); return }
    api.get(`/schedule/${selectedBarber._id}`).then((res) => {
      setSchedule(res.data.schedule)
    }).catch(() => setSchedule(null))
  }, [selectedBarber])

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

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

  const slotMap = useMemo(() => {
    const m = {}
    slotsData.forEach(({ date, slots }) => {
      slots.forEach(({ time, available }) => { m[`${date}|${time}`] = available })
    })
    return m
  }, [slotsData])

  const timeLabels = useMemo(() => {
    const set = new Set()
    slotsData.forEach(({ slots }) => slots.forEach(({ time }) => set.add(time)))
    return [...set].sort()
  }, [slotsData])

  const weekLabel = (() => {
    const fmt = (d) =>
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${fmt(weekDates[0])} – ${fmt(weekDates[6])} ${weekDates[0].getFullYear()}`
  })()

  const slotLabel = selectedSlot
    ? `${new Date(selectedSlot.dateStr + 'T00:00:00').toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric', month: 'short' })}, ${selectedSlot.time}`
    : null

  const canConfirm = selectedService && selectedBarber && selectedSlot && !submitLoading

  const handleConfirm = async () => {
    if (!canConfirm) return
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      await api.post('/bookings', {
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
              {timeLabels.length === 0 && !loadingSlots && selectedBarber && (
                <div style={{ color: '#555', padding: '24px', gridColumn: '1/-1' }}>
                  {schedule ? 'Bu hafta ish vaqti yo\'q' : 'Jadval hali sozlanmagan'}
                </div>
              )}
              {loadingSlots && (
                <div style={{ color: '#555', padding: '24px', gridColumn: '1/-1' }}>Yuklanmoqda…</div>
              )}
              {timeLabels.map((time, hi) => (
                <React.Fragment key={`row-${hi}`}>
                  <div className={styles.timeLabel}>{time}</div>
                  {weekDates.map((date, di) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const key = `${dateStr}|${time}`
                    const available = slotMap[key]
                    const inMap = key in slotMap
                    const now = new Date()
                    const slotDate = new Date(dateStr + 'T' + time + ':00')
                    const past = slotDate < now
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
                          past && inMap ? styles.slotPast : '',
                          isSelected ? styles.slotSelected : '',
                          isToday ? styles.slotToday : '',
                          inMap && available && !past ? styles.slotAvailable : '',
                        ].filter(Boolean).join(' ')}
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
                </React.Fragment>
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
            onClick={handleConfirm}
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
