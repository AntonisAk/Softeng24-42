import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { apiClient } from "../api/client";
import styles from "./styles/Debts.module.css";

function Debts() {
  const { auth } = useContext(AuthContext);
  const [debts, setDebts] = useState({ owes: [], owned: [] });
  const [payment, setPayment] = useState({
    toOperatorId: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const fetchDebts = async () => {
    try {
      const data = await apiClient.getDebts(auth.token);
      setDebts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch debts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [auth.token]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payment.toOperatorId || !payment.amount) {
      setError("Please select an operator and enter an amount");
      return;
    }

    if (isNaN(payment.amount) || parseFloat(payment.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.payDebt(auth.token, payment);
      setSuccess(result.message);
      setPayment({ toOperatorId: "", amount: "" });
      fetchDebts(); // Refresh debts after successful payment

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !debts.owes.length) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.debts}>
      <h1>Debts Overview</h1>

      <div className={styles.tables}>
        <div className={styles.tableContainer}>
          <h2>Money You Owe</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {debts.owes.map((debt) => (
                <tr key={debt.operator}>
                  <td>{debt.operator}</td>
                  <td>€{parseFloat(debt.amount).toFixed(2)}</td>
                </tr>
              ))}
              {debts.owes.length === 0 && (
                <tr>
                  <td colSpan="2" className={styles.emptyState}>
                    No debts to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableContainer}>
          <h2>Money Owed to You</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {debts.owned.map((debt) => (
                <tr key={debt.operator}>
                  <td>{debt.operator}</td>
                  <td>€{parseFloat(debt.amount).toFixed(2)}</td>
                </tr>
              ))}
              {debts.owned.length === 0 && (
                <tr>
                  <td colSpan="2" className={styles.emptyState}>
                    No money owed to you
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h2>Make a Payment</h2>
        <form onSubmit={handlePaymentSubmit} className={styles.paymentForm}>
          <div className={styles.formGroup}>
            <label htmlFor="operator">Select Operator</label>
            <select
              id="operator"
              value={payment.toOperatorId}
              onChange={(e) =>
                setPayment((prev) => ({
                  ...prev,
                  toOperatorId: e.target.value,
                }))
              }
              disabled={isLoading}
            >
              <option value="">Select an operator</option>
              {debts.owes.map((debt) => (
                <option key={debt.operator} value={debt.operator}>
                  {debt.operator} (€{parseFloat(debt.amount).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount (€)</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={payment.amount}
              onChange={(e) =>
                setPayment((prev) => ({ ...prev, amount: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button
            type="submit"
            className={styles.payButton}
            disabled={isLoading || !payment.toOperatorId}
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Debts;
