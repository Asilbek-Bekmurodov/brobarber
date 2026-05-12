import styles from './ServicesSection.module.css'

const SERVICES = [
  {
    id: '01',
    title: 'Haircuts',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop',
    items: ['Classic Cut', 'Fade Cut', 'Taper Cut', 'Crew Cut', 'Kids Cut'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: '02',
    title: 'Beard & Shaving',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80&auto=format&fit=crop',
    items: ['Beard Trim & Shape', 'Hot Towel Shave', 'Straight Razor', 'Beard Design', 'Mustache Trim'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2h10l2 6H5L7 2z" />
        <path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    id: '03',
    title: 'Hair Coloring',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop',
    items: ['Full Color', 'Highlights', 'Ombre & Balayage', 'Toning', 'Gray Coverage'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
        <path d="M22 22l-5-5" />
        <path d="M17 22l5-5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: '04',
    title: 'Hair Treatments',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
    items: ['Scalp Treatment', 'Deep Conditioning', 'Keratin Treatment', 'Hair Mask', 'Scalp Massage'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: '05',
    title: 'Luxury Packages',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&auto=format&fit=crop',
    items: ['The Gentleman', 'VIP Experience', 'Wedding Package', 'Monthly Membership', 'Father & Son'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]

const ServicesSection = () => {
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
          {SERVICES.map((service) => (
            <div key={service.id} className={styles.card}>
              <div
                className={styles.cardBg}
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className={styles.cardOverlay} />

              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>{service.id}</span>
                  <span className={styles.cardIcon}>{service.icon}</span>
                </div>

                <h3 className={styles.cardTitle}>{service.title}</h3>
                <div className={styles.divider} />

                <ul className={styles.serviceList}>
                  {service.items.map((item) => (
                    <li key={item} className={styles.serviceItem}>
                      <span className={styles.bullet} />
                      {item}
                    </li>
                  ))}
                </ul>

                <button className={styles.bookBtn}>
                  Book Now
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.allServicesBtn}>
            View All Services
          </button>
        </div>

      </div>
    </section>
  )
}

export default ServicesSection
