import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import styles from "./styles/Header.module.css";

function Header() {
  const { auth, setAuth } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(null);
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img
            src="https://cdn1.iconfinder.com/data/icons/prettycons-urban-vol-1-ultra/60/36-Parking_Toll-city_urban_building_street-64.png"
            alt="InterPayToll"
          />
          <span>InterPayToll</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        {auth ? (
          <>
            <Link to="/debts">Debts</Link>
            <Link to="/charts">Charts</Link>
            <Link to="/map">Map</Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/signin">Sign In</Link>
        )}
      </nav>

      {showLogoutConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalActions}>
              <button onClick={handleLogout}>Yes, Logout</button>
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

export default Header;
