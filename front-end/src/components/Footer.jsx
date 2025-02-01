import styles from "./styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.section}>
          <h3>InterPayToll</h3>
          <p>Simplifying toll payments across highways</p>
        </div>
        <div className={styles.section}>
          <h3>Contact</h3>
          <p>Email: support@interpaytoll.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        <div className={styles.section}>
          <h3>Legal</h3>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; 2025 InterPayToll. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
