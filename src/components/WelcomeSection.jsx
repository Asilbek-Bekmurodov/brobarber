import styles from './WelcomeSection.module.css'

const WelcomeSection = () => {
  return (
    <section className={styles.welcome}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Welcome to <span className={styles.highlight}>Trim</span> A Hair Salon
        </h2>

        <div className={styles.separators}>
          <span className={styles.diamond}></span>
          <span className={styles.diamond}></span>
          <span className={styles.diamond}></span>
        </div>

        <p className={styles.body}>
          On her way she met a copy. The copy warned the Little Blind Text, that where 
          it came from it would have been rewritten a thousand times and everything 
          that was left from its origin would be the word "and" and the Little Blind 
          Text should turn around and return to its own, safe country. But nothing 
          the copy said could convince her and so it didn't take long until a few 
          insidious Copy Writers ambushed her, made her drunk with Longe and Parole 
          and dragged her into their agency, where they abused her for their projects 
          again and again. And if she hasn't been rewritten, then they are still 
          using her.
        </p>
      </div>
    </section>
  )
}

export default WelcomeSection
