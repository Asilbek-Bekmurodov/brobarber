import { useState, useMemo, useEffect } from 'react'
import styles from './DashboardPage.module.css'

// ── Mock Data ──────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  { id: 1, name: 'James Harrington', phone: '+1 (212) 555-0101', role: 'Client', joined: '2024-01-15' },
  { id: 2, name: 'Sofia Delacroix', phone: '+1 (212) 555-0182', role: 'Client', joined: '2024-02-03' },
  { id: 3, name: 'Marcus Webb', phone: '+1 (212) 555-0234', role: 'Admin', joined: '2023-11-20' },
  { id: 4, name: 'Elena Vasquez', phone: '+1 (212) 555-0319', role: 'Client', joined: '2024-03-11' },
  { id: 5, name: 'Thomas Aldridge', phone: '+1 (212) 555-0472', role: 'Client', joined: '2024-04-07' },
  { id: 6, name: 'Naomi Okafor', phone: '+1 (212) 555-0568', role: 'Manager', joined: '2023-09-14' },
  { id: 7, name: 'Luca Ferrante', phone: '+1 (212) 555-0621', role: 'Client', joined: '2024-05-22' },
  { id: 8, name: 'Claire Beaumont', phone: '+1 (212) 555-0789', role: 'Client', joined: '2024-01-30' },
]

const INITIAL_BARBERS = [
  { id: 1, name: 'James Wilson', role: 'Master Barber', experience: '14 Years', specialty: 'Classic Cuts & Hot Towel Shaves', status: 'Active' },
  { id: 2, name: 'Marcus Reed', role: 'Senior Barber', experience: '9 Years', specialty: 'Fades, Tapers & Beard Design', status: 'Active' },
  { id: 3, name: 'Daniel Hayes', role: 'Color Specialist', experience: '7 Years', specialty: 'Color, Highlights & Treatments', status: 'Active' },
  { id: 4, name: 'Elijah Cross', role: 'Junior Barber', experience: '3 Years', specialty: 'Modern Cuts & Grooming', status: 'Active' },
  { id: 5, name: 'Oscar Neville', role: 'Senior Barber', experience: '11 Years', specialty: 'Straight Razor & Traditional', status: 'Inactive' },
]

const INITIAL_SERVICES = [
  { id: 1, title: 'Classic Haircut', category: 'Haircuts', price: '$45', duration: '45 min', status: 'Active' },
  { id: 2, title: 'Skin Fade', category: 'Haircuts', price: '$55', duration: '60 min', status: 'Active' },
  { id: 3, title: 'Beard Trim & Shape', category: 'Beard', price: '$30', duration: '30 min', status: 'Active' },
  { id: 4, title: 'Hot Towel Shave', category: 'Shaving', price: '$65', duration: '60 min', status: 'Active' },
  { id: 5, title: 'Full Color', category: 'Coloring', price: '$120', duration: '90 min', status: 'Active' },
  { id: 6, title: 'Balayage & Highlights', category: 'Coloring', price: '$160', duration: '120 min', status: 'Active' },
  { id: 7, title: 'Keratin Treatment', category: 'Treatments', price: '$200', duration: '120 min', status: 'Inactive' },
  { id: 8, title: 'The Gentleman Package', category: 'Packages', price: '$95', duration: '90 min', status: 'Active' },
  { id: 9, title: 'VIP Experience', category: 'Packages', price: '$180', duration: '150 min', status: 'Active' },
]

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

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1
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

const USER_ROLES = ['Client', 'Admin', 'Manager']

const EMPTY_USER = { name: '', phone: '', role: 'Client', joined: '' }

function UsersSection() {
  const [rows, setRows] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', data }
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_USER)

  const filtered = useMemo(() => {
    let r = rows.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'za') r = [...r].sort((a, b) => b.name.localeCompare(a.name))
    if (sort === 'newest') r = [...r].sort((a, b) => new Date(b.joined) - new Date(a.joined))
    if (sort === 'oldest') r = [...r].sort((a, b) => new Date(a.joined) - new Date(b.joined))
    return r
  }, [rows, search, sort])

  const openAdd = () => { setForm(EMPTY_USER); setModal({ mode: 'add' }) }
  const openEdit = (row) => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }) }
  const closeModal = () => setModal(null)

  const handleSave = () => {
    if (!form.name.trim()) return
    if (modal.mode === 'add') {
      setRows(r => [...r, { ...form, id: nextId(r) }])
    } else {
      setRows(r => r.map(u => u.id === modal.id ? { ...form, id: modal.id } : u))
    }
    closeModal()
  }

  const handleDelete = (id) => {
    setRows(r => r.filter(u => u.id !== id))
    setConfirmDelete(null)
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Users</h2>
          <p className={styles.sectionSub}>Manage registered accounts and roles</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}><IconPlus /> Add User</button>
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
                      <button className={styles.editBtn} onClick={() => openEdit(row)}><IconEdit /> Edit</button>
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

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add User' : 'Edit User'} onClose={closeModal}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="James Harrington" />
            </div>
            <div className={styles.formField}>
              <label>Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (212) 555-0000" />
            </div>
            <div className={styles.formField}>
              <label>Role</label>
              <div className={styles.selectWrap}>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {USER_ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                <span className={styles.selectChevron}><IconChevron /></span>
              </div>
            </div>
            <div className={styles.formField}>
              <label>Joined Date</label>
              <input type="date" value={form.joined} onChange={e => setForm(f => ({ ...f, joined: e.target.value }))} />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>
              {modal.mode === 'add' ? 'Add User' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}

// ── Barbers Section ────────────────────────────────────────────────────────

const BARBER_ROLES = ['Master Barber', 'Senior Barber', 'Junior Barber', 'Color Specialist']
const EMPTY_BARBER = { name: '', role: 'Senior Barber', experience: '', specialty: '', status: 'Active' }

function BarbersSection() {
  const [rows, setRows] = useState(INITIAL_BARBERS)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_BARBER)

  const filtered = useMemo(() => {
    let r = rows.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'za') r = [...r].sort((a, b) => b.name.localeCompare(a.name))
    if (sort === 'newest') r = [...r].sort((a, b) => b.id - a.id)
    if (sort === 'oldest') r = [...r].sort((a, b) => a.id - b.id)
    return r
  }, [rows, search, sort])

  const openAdd = () => { setForm(EMPTY_BARBER); setModal({ mode: 'add' }) }
  const openEdit = (row) => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }) }
  const closeModal = () => setModal(null)

  const handleSave = () => {
    if (!form.name.trim()) return
    if (modal.mode === 'add') {
      setRows(r => [...r, { ...form, id: nextId(r) }])
    } else {
      setRows(r => r.map(u => u.id === modal.id ? { ...form, id: modal.id } : u))
    }
    closeModal()
  }

  const handleDelete = (id) => { setRows(r => r.filter(u => u.id !== id)); setConfirmDelete(null) }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Barbers</h2>
          <p className={styles.sectionSub}>Manage team members and their profiles</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}><IconPlus /> Add Barber</button>
      </div>

      <TableControls count={filtered.length} label="barbers" search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Name</th><th>Role</th><th>Experience</th><th>Specialty</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              confirmDelete === row.id ? (
                <tr key={row.id} className={styles.deleteRow}>
                  <td colSpan={7}>
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
                  <td className={styles.mutedCell}>{row.role}</td>
                  <td className={styles.mutedCell}>{row.experience}</td>
                  <td className={styles.mutedCell}>{row.specialty}</td>
                  <td><span className={`${styles.statusBadge} ${row.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{row.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(row)}><IconEdit /> Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(row.id)}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className={styles.emptyRow}>No barbers found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Barber' : 'Edit Barber'} onClose={closeModal}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="James Wilson" />
            </div>
            <div className={styles.formField}>
              <label>Role</label>
              <div className={styles.selectWrap}>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {BARBER_ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                <span className={styles.selectChevron}><IconChevron /></span>
              </div>
            </div>
            <div className={styles.formField}>
              <label>Experience</label>
              <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="e.g. 9 Years" />
            </div>
            <div className={styles.formField}>
              <label>Specialty</label>
              <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Fades & Tapers" />
            </div>
            <div className={styles.formField}>
              <label>Status</label>
              <div className={styles.selectWrap}>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Active</option><option>Inactive</option>
                </select>
                <span className={styles.selectChevron}><IconChevron /></span>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>{modal.mode === 'add' ? 'Add Barber' : 'Save Changes'}</button>
          </div>
        </Modal>
      )}
    </section>
  )
}

// ── Services Section ───────────────────────────────────────────────────────

const SERVICE_CATEGORIES = ['Haircuts', 'Beard', 'Shaving', 'Coloring', 'Treatments', 'Packages']
const EMPTY_SERVICE = { title: '', category: 'Haircuts', price: '', duration: '', status: 'Active' }

function ServicesSection() {
  const [rows, setRows] = useState(INITIAL_SERVICES)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('az')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_SERVICE)

  const filtered = useMemo(() => {
    let r = rows.filter(u => u.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'az') r = [...r].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'za') r = [...r].sort((a, b) => b.title.localeCompare(a.title))
    if (sort === 'newest') r = [...r].sort((a, b) => b.id - a.id)
    if (sort === 'oldest') r = [...r].sort((a, b) => a.id - b.id)
    return r
  }, [rows, search, sort])

  const openAdd = () => { setForm(EMPTY_SERVICE); setModal({ mode: 'add' }) }
  const openEdit = (row) => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }) }
  const closeModal = () => setModal(null)

  const handleSave = () => {
    if (!form.title.trim()) return
    if (modal.mode === 'add') {
      setRows(r => [...r, { ...form, id: nextId(r) }])
    } else {
      setRows(r => r.map(u => u.id === modal.id ? { ...form, id: modal.id } : u))
    }
    closeModal()
  }

  const handleDelete = (id) => { setRows(r => r.filter(u => u.id !== id)); setConfirmDelete(null) }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Services</h2>
          <p className={styles.sectionSub}>Manage the service catalogue and pricing</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}><IconPlus /> Add Service</button>
      </div>

      <TableControls count={filtered.length} label="services" search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Title</th><th>Category</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              confirmDelete === row.id ? (
                <tr key={row.id} className={styles.deleteRow}>
                  <td colSpan={7}>
                    <div className={styles.deleteConfirm}>
                      <span>Delete <strong>{row.title}</strong>?</span>
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
                  <td className={styles.nameCell}>{row.title}</td>
                  <td><span className={styles.categoryBadge}>{row.category}</span></td>
                  <td className={styles.priceCell}>{row.price}</td>
                  <td className={styles.mutedCell}>{row.duration}</td>
                  <td><span className={`${styles.statusBadge} ${row.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{row.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(row)}><IconEdit /> Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(row.id)}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className={styles.emptyRow}>No services found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Service' : 'Edit Service'} onClose={closeModal}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Service Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Classic Haircut" />
            </div>
            <div className={styles.formField}>
              <label>Category</label>
              <div className={styles.selectWrap}>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <span className={styles.selectChevron}><IconChevron /></span>
              </div>
            </div>
            <div className={styles.formField}>
              <label>Price</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="$45" />
            </div>
            <div className={styles.formField}>
              <label>Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="45 min" />
            </div>
            <div className={styles.formField}>
              <label>Status</label>
              <div className={styles.selectWrap}>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Active</option><option>Inactive</option>
                </select>
                <span className={styles.selectChevron}><IconChevron /></span>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>{modal.mode === 'add' ? 'Add Service' : 'Save Changes'}</button>
          </div>
        </Modal>
      )}
    </section>
  )
}

// ── Stats Overview ─────────────────────────────────────────────────────────

function OverviewSection({ users, barbers, services }) {
  const activeServices = services.filter(s => s.status === 'Active').length
  const stats = [
    { label: 'Total Users', value: users.length, icon: <IconUsers />, note: 'Registered accounts' },
    { label: 'Total Barbers', value: barbers.length, icon: <IconScissors />, note: 'Team members' },
    { label: 'Active Services', value: activeServices, icon: <IconList />, note: `of ${services.length} in catalogue` },
    { label: 'Appointments Today', value: 7, icon: <IconCalendar />, note: 'Scheduled for today' },
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
  const [active, setActive] = useState('overview')

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
            <div className={styles.avatar}>M</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>Marcus Webb</span>
              <span className={styles.profileRole}>Administrator</span>
            </div>
          </div>
          <button className={styles.logoutBtn}><IconLogout /> Sign out</button>
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
          {active === 'overview' && (
            <OverviewSection
              users={INITIAL_USERS}
              barbers={INITIAL_BARBERS}
              services={INITIAL_SERVICES}
            />
          )}
          {active === 'users' && <UsersSection />}
          {active === 'barbers' && <BarbersSection />}
          {active === 'services' && <ServicesSection />}
        </div>
      </main>
    </div>
  )
}
