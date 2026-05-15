import { useParams, Link, Navigate } from 'react-router-dom'
import { BARBERS } from '../data/barbers'
import styles from './BarberDetailPage.module.css'

const BarberDetailPage = () => {
  const { id } = useParams()
  const barber = BARBERS.find((b) => b.id === id)

  if (!barber) return <Navigate to="/" replace />

  const currentIndex = BARBERS.findIndex((b) => b.id === id)
  const nextBarber = BARBERS[(currentIndex + 1) % BARBERS.length]

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${barber.heroBg})` }}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <Link to="/" className={styles.backBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </Link>

          <div className={styles.heroBottom}>
            <div className={styles.heroBadge}>{barber.role}</div>
            <h1 className={styles.heroName}>{barber.name}</h1>
            <p className={styles.heroTagline}>{barber.tagline}</p>
          </div>
        </div>
      </section>

      {/* ── Detail Body ── */}
      <div className={styles.body}>

        {/* Portrait + Bio */}
        <div className={styles.introGrid}>
          <div className={styles.portraitWrap}>
            <div
              className={styles.portrait}
              style={{ backgroundImage: `url(${barber.image})` }}
            />
            <div className={styles.portraitMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Experience</span>
                <span className={styles.metaValue}>{barber.experience}</span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Specialty</span>
                <span className={styles.metaValue}>{barber.specialty}</span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Instagram</span>
                <span className={styles.metaValue}>{barber.instagram}</span>
              </div>
            </div>
          </div>

          <div className={styles.bioWrap}>
            <span className={styles.bioEyebrow}>About</span>
            <div className={styles.bioDivider} />
            {barber.fullBio.split('\n\n').map((para, i) => (
              <p key={i} className={styles.bioPara}>{para}</p>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className={styles.skillsSection}>
          <span className={styles.skillsEyebrow}>Specialisations</span>
          <div className={styles.skillsDivider} />
          <div className={styles.skillsGrid}>
            {barber.skills.map((skill, i) => (
              <div key={skill} className={styles.skillItem}>
                <span className={styles.skillNumber}>0{i + 1}</span>
                <span className={styles.skillName}>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <div className={styles.ctaSeparators}>
              <span className={styles.ctaLine} />
              <span className={styles.ctaDiamond} />
              <span className={styles.ctaDiamond} />
              <span className={styles.ctaDiamond} />
              <span className={styles.ctaLine} />
            </div>
            <h2 className={styles.ctaHeading}>
              Ready to book with <span className={styles.ctaAccent}>{barber.name.split(' ')[0]}?</span>
            </h2>
            <p className={styles.ctaBody}>
              Reach out directly — {barber.name.split(' ')[0]} will get back to you to confirm your appointment.
            </p>
            <div className={styles.ctaActions}>
              <a
                href={`https://wa.me/${barber.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Message on WhatsApp
              </a>
              <Link to="/" className={styles.ctaSecondary}>
                View All Barbers
              </Link>
            </div>
          </div>
        </div>

        {/* Next Barber */}
        <Link to={`/barbers/${nextBarber.id}`} className={styles.nextBarber}>
          <div
            className={styles.nextBg}
            style={{ backgroundImage: `url(${nextBarber.image})` }}
          />
          <div className={styles.nextOverlay} />
          <div className={styles.nextContent}>
            <span className={styles.nextLabel}>Next Barber</span>
            <span className={styles.nextName}>{nextBarber.name}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>

      </div>
    </div>
  )
}

export default BarberDetailPage
