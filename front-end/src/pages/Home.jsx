import styles from "./styles/Home.module.css";

function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Seamless Toll Payment Solutions</h1>
          <p>
            Manage and track your highway toll payments across multiple
            operators with ease and efficiency.
          </p>
        </div>
        <div className={styles.heroImage}>
          <img
            src="https://tse2.mm.bing.net/th?id=OIP.bXoYRRC437l0640tmAn1cQHaC9&pid=Api&P=0&h=220"
            alt="Highway toll system"
          />
        </div>
      </section>

      <section className={styles.features}>
        <h2>Key Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <img
              src="https://cdn3.iconfinder.com/data/icons/euro-trading/512/payments-64.png"
              alt="Easy payments"
            />
            <h3>Easy Payments</h3>
            <p>
              Settle your toll debts quickly with our streamlined payment
              system.
            </p>
          </div>
          <div className={styles.feature}>
            <img
              src="https://cdn4.iconfinder.com/data/icons/shopping-e-commerce-1/128/Tracking-Track-Order-Location-64.png"
              alt="Interactive maps"
            />
            <h3>Interactive Maps</h3>
            <p>Visualize toll locations and plan your routes efficiently.</p>
          </div>
          <div className={styles.feature}>
            <img
              src="https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/18_Analytics_logo_logos-64.png"
              alt="Analytics"
            />
            <h3>Advanced Analytics</h3>
            <p>Get detailed insights into your toll usage and expenses.</p>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <h3>10+</h3>
          <p>Highway Operators</p>
        </div>
        <div className={styles.stat}>
          <h3>1M+</h3>
          <p>Daily Transactions</p>
        </div>
        <div className={styles.stat}>
          <h3>98%</h3>
          <p>Customer Satisfaction</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
