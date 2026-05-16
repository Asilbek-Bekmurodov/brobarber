import { useSelector, useDispatch } from 'react-redux'
import { setRecentBooking } from '../store/authSlice'
import HeroSection from '../components/HeroSection'
import InfoBar from '../components/InfoBar'
import ServicesSection from '../components/ServicesSection'
import TeamSection from '../components/TeamSection'
import ContactSection from '../components/ContactSection'

const HomePage = () => {
  const dispatch = useDispatch()
  const recentBooking = useSelector((s) => s.auth.recentBooking)

  return (
    <>
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
      <HeroSection />
      <InfoBar />
      <ServicesSection />
      <TeamSection />
      <ContactSection />
    </>
  )
}

export default HomePage
