import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./styles/Debts.module.css";

export default function Debts() {
  const { token } = useAuth();
  const [debts, setDebts] = useState({ owes: [], owned: [] });
  const [paymentData, setPaymentData] = useState({
    toOperatorId: "",
    amount: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDebts = async () => {
    try {
      const response = await fetch("https://localhost:9115/api/debts", {
        headers: {
          "X-OBSERVATORY-AUTH": token,
        },
      });
      const data = await response.json();
      setDebts(data);
    } catch (error) {
      console.error("Error fetching debts:", error);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [token, fetchDebts]); // Added fetchDebts to dependencies

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://localhost:9115/api/debts/pay", {
        method: "POST",
        headers: {
          "X-OBSERVATORY-AUTH": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Payment processed successfully!");
        setPaymentData({ toOperatorId: "", amount: "" });
        fetchDebts(); // Refresh the debts data
      } else {
        throw new Error(data.error || "Payment failed");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.debtsContainer}>
      <h1>Debt Management</h1>

      <div className={styles.tablesContainer}>
        <div className={styles.tableWrapper}>
          <h2>Money You Owe</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {debts.owes.map((debt, index) => (
                <tr key={index}>
                  <td>{debt.operator}</td>
                  <td>€{debt.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableWrapper}>
          <h2>Money Owed to You</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {debts.owned.map((debt, index) => (
                <tr key={index}>
                  <td>{debt.operator}</td>
                  <td>€{debt.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h2>Make a Payment</h2>
        {message && (
          <div
            className={`${styles.message} ${
              message.includes("success") ? styles.success : styles.error
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handlePayment} className={styles.paymentForm}>
          <div className={styles.formGroup}>
            <label htmlFor="operator">Operator</label>
            <select
              id="operator"
              value={paymentData.toOperatorId}
              onChange={(e) =>
                setPaymentData({ ...paymentData, toOperatorId: e.target.value })
              }
              required
            >
              <option value="">Select Operator</option>
              {debts.owes.map((debt, index) => (
                <option key={index} value={debt.operator}>
                  {debt.operator}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({ ...paymentData, amount: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
