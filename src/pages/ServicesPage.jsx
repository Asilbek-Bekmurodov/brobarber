import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import styles from './ServicesPage.module.css'

const SERVICES = [
  {
    id: '01',
    title: 'Haircuts',
    description:
      'Precision cuts tailored to your face shape and lifestyle. Our master barbers combine classical technique with modern artistry to craft a look that is unmistakably yours.',
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop',
    items: [
      { name: 'Classic Cut', price: 'From $25' },
      { name: 'Fade Cut', price: 'From $30' },
      { name: 'Taper Cut', price: 'From $28' },
      { name: 'Crew Cut', price: 'From $25' },
      { name: 'Kids Cut', price: 'From $20' },
    ],
  },
  {
    id: '02',
    title: 'Beard & Shaving',
    description:
      'From meticulous beard sculpting to the indulgent ritual of a hot towel straight razor shave — a gentleman\'s grooming ceremony, perfected to a timeless art form.',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80&auto=format&fit=crop',
    items: [
      { name: 'Beard Trim & Shape', price: 'From $20' },
      { name: 'Hot Towel Shave', price: 'From $35' },
      { name: 'Straight Razor', price: 'From $40' },
      { name: 'Beard Design', price: 'From $25' },
      { name: 'Mustache Trim', price: 'From $15' },
    ],
  },
  {
    id: '03',
    title: 'Hair Coloring',
    description:
      'Expert color services that breathe new life into your look. From subtle tonal shifts to bold transformations — executed with salon-grade precision and artistry.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&auto=format&fit=crop',
    items: [
      { name: 'Full Color', price: 'From $75' },
      { name: 'Highlights', price: 'From $90' },
      { name: 'Ombre & Balayage', price: 'From $120' },
      { name: 'Toning', price: 'From $45' },
      { name: 'Gray Coverage', price: 'From $65' },
    ],
  },
  {
    id: '04',
    title: 'Hair Treatments',
    description:
      'Restorative treatments that nourish from root to tip. Restore vitality, shine, and strength with our curated selection of premium scalp and hair therapies.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop',
    items: [
      { name: 'Scalp Treatment', price: 'From $35' },
      { name: 'Deep Conditioning', price: 'From $30' },
      { name: 'Keratin Treatment', price: 'From $150' },
      { name: 'Hair Mask', price: 'From $25' },
      { name: 'Scalp Massage', price: 'From $40' },
    ],
  },
  {
    id: '05',
    title: 'Luxury Packages',
    description:
      'The complete gentleman\'s experience. Curated packages for every milestone — from everyday refinement to extraordinary occasions that demand nothing less than perfection.',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80&auto=format&fit=crop',
    items: [
      { name: 'The Gentleman', price: 'From $120' },
      { name: 'VIP Experience', price: 'From $200' },
      { name: 'Wedding Package', price: 'From $350' },
      { name: 'Monthly Membership', price: 'From $180' },
      { name: 'Father & Son', price: 'From $85' },
    ],
  },
]

const ServicesPage = () => {
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef([])

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(index) },
        { threshold: 0.4 }
      )
      observer.observe(ref)
      return observer
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  return (
    <div className={styles.page}>

      {/* Sticky side nav */}
      <nav className={styles.stickyNav}>
        <Link to="/" className={styles.backLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Home</span>
        </Link>

        <div className={styles.navDots}>
          {SERVICES.map((s, i) => (
            <button
              key={s.id}
              className={`${styles.navDot} ${activeSection === i ? styles.navDotActive : ''}`}
              onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })}
              aria-label={s.title}
            >
              <span className={styles.navDotIndicator} />
              <span className={styles.navDotLabel}>{s.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>BroBarbershop</span>
          <div className={styles.separators}>
            <span className={styles.sepLine} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.sepLine} />
          </div>
          <h1 className={styles.heroTitle}>
            Our<br />
            <em className={styles.heroAccent}>Services</em>
          </h1>
          <p className={styles.heroSub}>
            Five disciplines of grooming excellence —<br />
            each a craft perfected over generations.
          </p>
          <div className={styles.scrollHint}>
            <span className={styles.scrollLine} />
            <span className={styles.scrollText}>Scroll to explore</span>
          </div>
        </div>
      </header>

      {/* Service panels */}
      <main>
        {SERVICES.map((service, i) => (
          <section
            key={service.id}
            ref={el => (sectionRefs.current[i] = el)}
            className={`${styles.panel} ${i % 2 === 1 ? styles.panelReverse : ''}`}
          >
            <div className={styles.panelImageWrap}>
              <div
                className={styles.panelImg}
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className={styles.panelImgOverlay} />
              <span className={styles.panelBigNumber}>{service.id}</span>
            </div>

            <div className={styles.panelContent}>
              <span className={styles.panelEyebrow}>Category {service.id}</span>
              <h2 className={styles.panelTitle}>{service.title}</h2>
              <div className={styles.panelDivider} />
              <p className={styles.panelDesc}>{service.description}</p>

              <ul className={styles.chipList}>
                {service.items.map(item => (
                  <li key={item.name} className={styles.chip}>
                    <span className={styles.chipName}>{item.name}</span>
                    <span className={styles.chipPrice}>{item.price}</span>
                  </li>
                ))}
              </ul>

              <button className={styles.bookBtn}>
                Book this service
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </section>
        ))}
      </main>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <div className={styles.separators}>
            <span className={styles.sepLine} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.sepLine} />
          </div>
          <h2 className={styles.ctaTitle}>
            Ready to be<br />
            <em className={styles.ctaAccent}>Transformed?</em>
          </h2>
          <p className={styles.ctaBody}>
            Reserve your chair with one of our master barbers.<br />
            Your best look is one appointment away.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/" className={styles.ctaPrimary}>
              Book Your Appointment
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link to="/" className={styles.ctaSecondary}>Back to Home</Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default ServicesPage
