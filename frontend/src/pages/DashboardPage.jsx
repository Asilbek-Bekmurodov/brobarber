import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import api from '../lib/api'
import styles from './DashboardPage.module.css'

// ── Icons ──────────────────────────────────────────────────────────────────

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)
const IconScissors = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Modal ──────────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className={styles.modalBackdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}><IconX /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Table Controls ─────────────────────────────────────────────────────────

function TableControls({ count, label, search, setSearch, sort, setSort }) {
  return (
    <div className={styles.tableControls}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><IconSearch /></span>
        <input
          className={styles.searchInput}
          placeholder={`Filter ${label}…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.sortWrap}>
        <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="az">Name A → Z</option>
          <option value="za">Name Z → A</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <span className={styles.sortChevron}><IconChevron /></span>
      </div>
      <span className={styles.countBadge}>{count} {label}</span>
    </div>
  )
}

// ── Users Section ──────────────────────────────────────────────────────────

function UsersSection({ rows, onRefresh }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let r = rows.map(u => ({
      id: u._id,
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

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Users</h2>
          <p className={styles.sectionSub}>Manage registered accounts and roles</p>
        </div>
      </div>

      <TableControls count={filtered.length} label="users" search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              confirmDelete === row.id ? (
                <tr key={row.id} className={styles.deleteRow}>
                  <td colSpan={6}>
                    <div className={styles.deleteConfirm}>
                      <span>Delete <strong>{row.name}</strong>?</span>
                      <div className={styles.deleteActions}>
                        <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(row.id)}>Delete</button>
                        <button className={styles.cancelDeleteBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td className={styles.rowNum}>{i + 1}</td>
                  <td className={styles.nameCell}>{row.name}</td>
                  <td className={styles.mutedCell}>{row.phone}</td>
                  <td><span className={`${styles.roleBadge} ${styles[`role${row.role}`]}`}>{row.role}</span></td>
                  <td className={styles.mutedCell}>{formatDate(row.joined)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(row.id)}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className={styles.emptyRow}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Barbers Section ────────────────────────────────────────────────────────

function BarbersSection({ rows }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')

  const filtered = useMemo(() => {
    let r = rows.map(b => ({
      id: b._id,
      name: `${b.firstName} ${b.lastName}`,
      role: b.role,
      experience: '',
      specialty: b.bio || '—',
      status: 'Active',
    }))
    r = r.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'za') r = [...r].sort((a, b) => b.name.localeCompare(a.name))
    return r
  }, [rows, search, sort])

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Barbers</h2>
          <p className={styles.sectionSub}>Manage team members and their profiles</p>
        </div>
      </div>

      <TableControls count={filtered.length} label="barbers" search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Name</th><th>Role</th><th>Experience</th><th>Specialty</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id}>
                <td className={styles.rowNum}>{i + 1}</td>
                <td className={styles.nameCell}>{row.name}</td>
                <td className={styles.mutedCell}>{row.role}</td>
                <td className={styles.mutedCell}>{row.experience}</td>
                <td className={styles.mutedCell}>{row.specialty}</td>
                <td><span className={`${styles.statusBadge} ${row.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{row.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className={styles.emptyRow}>No barbers found</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Services Section ───────────────────────────────────────────────────────

function ServicesSection({ rows }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')

  const filtered = useMemo(() => {
    let r = rows.map(s => ({
      id: s._id,
      title: s.name,
      category: '—',
      price: `$${s.price}`,
      duration: `${s.duration} min`,
      status: 'Active',
    }))
    r = r.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'za') r = [...r].sort((a, b) => b.title.localeCompare(a.title))
    return r
  }, [rows, search, sort])

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Services</h2>
          <p className={styles.sectionSub}>Manage the service catalogue and pricing</p>
        </div>
      </div>

      <TableControls count={filtered.length} label="services" search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Title</th><th>Category</th><th>Price</th><th>Duration</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id}>
                <td className={styles.rowNum}>{i + 1}</td>
                <td className={styles.nameCell}>{row.title}</td>
                <td><span className={styles.categoryBadge}>{row.category}</span></td>
                <td className={styles.priceCell}>{row.price}</td>
                <td className={styles.mutedCell}>{row.duration}</td>
                <td><span className={`${styles.statusBadge} ${row.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{row.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className={styles.emptyRow}>No services found</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Stats Overview ─────────────────────────────────────────────────────────

function OverviewSection({ users, barbers, services, bookings }) {
  const stats = [
    { label: 'Total Users', value: users.length, icon: <IconUsers />, note: 'Registered accounts' },
    { label: 'Total Barbers', value: barbers.length, icon: <IconScissors />, note: 'Team members' },
    { label: 'Active Services', value: services.length, icon: <IconList />, note: 'In catalogue' },
    { label: 'Total Bookings', value: bookings.length, icon: <IconCalendar />, note: 'All time' },
  ]
  return (
    <section className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <p className={styles.sectionSub}>At-a-glance summary of your shop</p>
        </div>
      </div>
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statNote}>{s.note}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <IconGrid /> },
  { key: 'users', label: 'Users', icon: <IconUsers /> },
  { key: 'barbers', label: 'Barbers', icon: <IconScissors /> },
  { key: 'services', label: 'Services', icon: <IconList /> },
]

export default function DashboardPage() {
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

  return (
    <div className={styles.root}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>Trim.</div>
          <div className={styles.logoDivider} />
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`${styles.navItem} ${active === item.key ? styles.navActive : ''}`}
                onClick={() => setActive(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>{user?.firstName?.[0]?.toUpperCase() || 'A'}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</span>
              <span className={styles.profileRole}>{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}><IconLogout /> Sign out</button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.main}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>
              {NAV_ITEMS.find(n => n.key === active)?.label}
            </h1>
            <p className={styles.pageDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.topBarDot} />
            <span className={styles.topBarStatus}>Shop Open</span>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>Loading…</div>
          ) : (
            <>
              {active === 'overview' && (
                <OverviewSection users={users} barbers={barbers} services={services} bookings={bookings} />
              )}
              {active === 'users' && <UsersSection rows={users} onRefresh={fetchAll} />}
              {active === 'barbers' && <BarbersSection rows={barbers} />}
              {active === 'services' && <ServicesSection rows={services} />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
