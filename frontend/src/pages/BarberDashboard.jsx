import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import api from '../lib/api'
import styles from './BarberDashboard.module.css'

const DAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

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

function ServiceModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ? { name: initial.name, description: initial.description || '', price: initial.price, duration: initial.duration } : { name: '', description: '', price: '', duration: '' }
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

function MyServicesTab({ barberId }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

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
    if (!window.confirm('Serviceni o\'chirasizmi?')) return
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
            <tr><th>Nomi</th><th>Davomiyligi</th><th>Narxi</th><th>Amallar</th></tr>
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

  const barberId = user?._id || user?.id

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
        {tab === 'services' && <MyServicesTab barberId={barberId} />}
        {tab === 'schedule' && <MyScheduleTab barberId={barberId} />}
        {tab === 'clients'  && <MyClientsTab />}
      </main>
    </div>
  )
}
