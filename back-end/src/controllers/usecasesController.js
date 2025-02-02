const pool = require("../config/database");

const getOperatorDebts = async (req, res) => {
  const client = await pool.connect();
  try {
    // Get operator details based on username
    const { rows: operatorRows } = await client.query(
      "SELECT OperatorID FROM Operators WHERE Name = $1",
      [req.user.username]
    );

    if (operatorRows.length === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    const operatorId = operatorRows[0].operatorid;

    const debtsQuery = `
      SELECT 
        d.FromOperatorID,
        d.ToOperatorID,
        d.Amount as AmountOwed,
        op.Name as OperatorName,
        CASE 
          WHEN d.FromOperatorID = $1 THEN 'owes'
          ELSE 'owned'
        END as Type
      FROM Debts d
      JOIN Operators op ON 
        CASE 
          WHEN d.FromOperatorID = $1 THEN d.ToOperatorID = op.OperatorID
          ELSE d.FromOperatorID = op.OperatorID
        END
      WHERE 
        d.FromOperatorID = $1 OR d.ToOperatorID = $1
    `;

    const { rows } = await client.query(debtsQuery, [operatorId]);

    const formattedDebts = {
      owes: [],
      owned: [],
    };

    rows.forEach((row) => {
      const debtInfo = {
        operator: row.operatorname,
        opId:
          row.fromoperatorid === operatorId
            ? row.tooperatorid
            : row.fromoperatorid,
        amount: row.amountowed,
      };
      if (row.type === "owes" && row.amountowed > 0.0) {
        formattedDebts.owes.push(debtInfo);
      } else if (row.type === "owned" && row.amountowed > 0.0) {
        formattedDebts.owned.push(debtInfo);
      }
    });

    res.json(formattedDebts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const processPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { toOperatorId, amount } = req.body;

    if (!toOperatorId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment details" });
    }

    // Get operator details based on username
    const { rows: operatorRows } = await client.query(
      "SELECT OperatorID FROM Operators WHERE Name = $1",
      [req.user.username]
    );

    if (operatorRows.length === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    const fromOperatorId = operatorRows[0].operatorid;

    // Verify that toOperatorId exists
    const { rows: toOperatorRows } = await client.query(
      "SELECT OperatorID FROM Operators WHERE OperatorID = $1",
      [toOperatorId]
    );

    if (toOperatorRows.length === 0) {
      return res.status(404).json({ error: "Recipient operator not found" });
    }

    await client.query("BEGIN");

    // Get current debt
    const { rows: debtRows } = await client.query(
      "SELECT Amount FROM Debts WHERE FromOperatorID = $1 AND ToOperatorID = $2",
      [fromOperatorId, toOperatorId]
    );

    if (debtRows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "No debt record found between these operators" });
    }

    const currentDebt = debtRows[0].amount;

    if (amount > currentDebt) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Payment amount exceeds debt",
        currentDebt: currentDebt,
      });
    }

    // Update debt amount
    await client.query(
      "UPDATE Debts SET Amount = Amount - $1 WHERE FromOperatorID = $2 AND ToOperatorID = $3",
      [amount, fromOperatorId, toOperatorId]
    );

    await client.query("COMMIT");
    res.json({
      message: "Payment processed successfully",
      remainingDebt: currentDebt - amount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getOperatorDebts,
  processPayment,
};
