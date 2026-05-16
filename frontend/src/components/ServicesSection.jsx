import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import styles from './ServicesSection.module.css'

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&auto=format&fit=crop',
]

const ScissorsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
)

const ServicesSection = () => {
  const [services, setServices] = useState([])

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data.services)).catch(() => {})
  }, [])

  return (
    <section className={styles.services}>
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>What We Offer</span>

          <div className={styles.separators}>
            <span className={styles.line} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.line} />
          </div>

          <h2 className={styles.heading}>
            Expert Grooming,<br />
            <span className={styles.headingAccent}>Timeless Style</span>
          </h2>

          <p className={styles.subheading}>
            From precision cuts to luxury treatments — every service crafted
            for the modern gentleman who demands nothing less than excellence.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service, index) => {
            const cardNum = String(index + 1).padStart(2, '0')
            const image = CARD_IMAGES[index % CARD_IMAGES.length]
            const barberName = service.barber
              ? `${service.barber.firstName} ${service.barber.lastName}`
              : null

            return (
              <div key={service._id} className={styles.card}>
                <div
                  className={styles.cardBg}
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className={styles.cardOverlay} />

                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardNumber}>{cardNum}</span>
                    <span className={styles.cardIcon}><ScissorsIcon /></span>
                  </div>

                  <h3 className={styles.cardTitle}>{service.name}</h3>
                  <div className={styles.divider} />

                  <ul className={styles.serviceList}>
                    {service.description && (
                      <li className={styles.serviceItem}>
                        <span className={styles.bullet} />
                        {service.description}
                      </li>
                    )}
                    <li className={styles.serviceItem}>
                      <span className={styles.bullet} />
                      Duration: {service.duration} min
                    </li>
                    <li className={styles.serviceItem}>
                      <span className={styles.bullet} />
                      Price: ${service.price}
                    </li>
                    {barberName && (
                      <li className={styles.serviceItem}>
                        <span className={styles.bullet} />
                        Barber: {barberName}
                      </li>
                    )}
                  </ul>

                  <Link
                    to={`/booking?service=${encodeURIComponent(service.name)}`}
                    className={styles.bookBtn}
                    style={{ textDecoration: 'none' }}
                    onClick={e => e.stopPropagation()}
                  >
                    Book Now
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <Link to="/services" className={styles.allServicesBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
            View All Services
          </Link>
        </div>

      </div>
    </section>
  )
}

export default ServicesSection
