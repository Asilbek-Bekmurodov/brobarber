import styles from './HeroSection.module.css'

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <img
          src="/hero-bg.jpg"
          alt="Barbershop"
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <p className={styles.credit}>Created by Colorlib.com</p>
          <h1 className={styles.headline}>
            We will make you<br />stylish
          </h1>
          <button className={styles.ctaButton}>
            Book an Appointment
          </button>
        </div>
        <div className={styles.rightColumn}>
          <button className={styles.playButton} aria-label="Play video">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5.14v13.72c0 .65.73 1.04 1.27.68l10.6-6.86a.83.83 0 000-1.36L9.27 4.46A.83.83 0 008 5.14z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
