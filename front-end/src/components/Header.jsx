import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./styles/Header.module.css";

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src="/logo.svg"
          alt="InterPayToll Logo"
          className={styles.logoImg}
        />
        <h1>InterPayToll</h1>
      </div>
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/debts">Debts</Link>
            <Link to="/charts">Charts</Link>
            <Link to="/map">Map</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Sign In</Link>
        )}
      </nav>

      {showLogoutConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmLogout}>Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
