import styles from './ContactSection.module.css'

const ContactSection = () => {
  return (
    <section className={styles.contact}>
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>Get In Touch</span>
          <div className={styles.separators}>
            <span className={styles.line} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.diamond} />
            <span className={styles.line} />
          </div>
          <h2 className={styles.heading}>
            Find Us,{' '}
            <span className={styles.headingAccent}>Write to Us</span>
          </h2>
          <p className={styles.subheading}>
            Whether you have a question, a booking request, or simply want
            to say hello — we are always glad to hear from you.
          </p>
        </div>

        <div className={styles.grid}>

          {/* ── Map ── */}
          <div className={styles.mapWrap}>
            <div className={styles.mapLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              198 West 21st Street, Suite 721, New York NY 10016
            </div>
            <iframe
              className={styles.map}
              title="Trim Barbershop Location"
              src="https://maps.google.com/maps?q=198+W+21st+St,+New+York,+NY+10011&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* ── Form + Socials ── */}
          <div className={styles.rightCol}>

            <form
              className={styles.form}
              action="https://formspree.io/f/YOUR_FORM_ID"
              method="POST"
            >
              <div className={styles.formHeader}>
                <span className={styles.formEyebrow}>Send a Message</span>
                <div className={styles.formDivider} />
              </div>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className={styles.input}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className={styles.textarea}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Message
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* ── Social Links ── */}
            <div className={styles.socials}>
              <div className={styles.socialsDivider} />

              <a href="tel:+0001234567890" className={styles.socialItem}>
                <span className={styles.socialIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </span>
                <div className={styles.socialText}>
                  <span className={styles.socialLabel}>Phone</span>
                  <span className={styles.socialValue}>000 (123) 456 7890</span>
                </div>
              </a>

              <a href="https://t.me/trimbarbershop" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <span className={styles.socialIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.22 14.602l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.596.984z" />
                  </svg>
                </span>
                <div className={styles.socialText}>
                  <span className={styles.socialLabel}>Telegram</span>
                  <span className={styles.socialValue}>@trimbarbershop</span>
                </div>
              </a>

              <a href="https://instagram.com/trimbarbershop" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <span className={styles.socialIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                <div className={styles.socialText}>
                  <span className={styles.socialLabel}>Instagram</span>
                  <span className={styles.socialValue}>@trimbarbershop</span>
                </div>
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default ContactSection
