import styles from "./styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to InterPayToll</h1>
          <p>Seamless toll payment management across highways</p>
        </div>
      </section>

      <section className={styles.features}>
        <h2>Why Choose InterPayToll?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <img src="/icons/payment.svg" alt="Easy Payments" />
            <h3>Easy Payments</h3>
            <p>Manage and settle toll payments effortlessly</p>
          </div>
          <div className={styles.feature}>
            <img src="/icons/analytics.svg" alt="Real-time Analytics" />
            <h3>Real-time Analytics</h3>
            <p>Track your toll expenses with detailed analytics</p>
          </div>
          <div className={styles.feature}>
            <img src="/icons/map.svg" alt="Interactive Maps" />
            <h3>Interactive Maps</h3>
            <p>View toll locations and plan your routes</p>
          </div>
        </div>
      </section>
    </div>
  );
}
