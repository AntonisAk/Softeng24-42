const pool = require("../config/database");

class TollStation {
  static async getAllStations() {
    const result = await pool.query("SELECT * FROM Tollstations");
    return result.rows;
  }

  static async getStationsByOperator(operatorId) {
    const result = await pool.query(
      "SELECT * FROM Tollstations WHERE OperatorID = $1",
      [operatorId]
    );
    return result.rows;
  }

  static async getStation(stationId) {
    const result = await pool.query(
      "SELECT * FROM Tollstations WHERE TollID = $1",
      [stationId]
    );
    return result.rows[0];
  }
}

class Pass {
  static async getPassesByStation(stationId, dateFrom, dateTo) {
    const result = await pool.query(
      `SELECT 
        p.*,
        t.OperatorID as stationOperator
       FROM Passes p
       JOIN Tollstations t ON p.TollID = t.TollID
       WHERE p.TollID = $1 
       AND p.timestamp BETWEEN $2 AND $3
       ORDER BY p.timestamp ASC`,
      [stationId, dateFrom, dateTo]
    );
    return result.rows;
  }

  static async getPassesByOperators(stationOpId, tagOpId, dateFrom, dateTo) {
    const result = await pool.query(
      `SELECT p.*
       FROM Passes p
       JOIN Tollstations t ON p.TollID = t.TollID
       WHERE t.TollID = $1 
       AND p.tagHomeID = $2
       AND p.timestamp BETWEEN $3 AND $4
       ORDER BY p.timestamp ASC`,
      [stationOpId, tagOpId, dateFrom, dateTo]
    );
    return result.rows;
  }

  static async getPassesCost(stationOpId, tagOpId, dateFrom, dateTo) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as nPasses,
        SUM(p.charge) as totalCost
       FROM Passes p
       JOIN Tollstations t ON p.TollID = t.TollID
       WHERE t.OperatorID = $1 
       AND p.tagHomeID = $2
       AND p.timestamp BETWEEN $3 AND $4`,
      [stationOpId, tagOpId, dateFrom, dateTo]
    );
    return result.rows[0];
  }

  static async deleteAllPasses() {
    await pool.query("TRUNCATE TABLE Passes CASCADE");
  }

  static async addPass(timestamp, tollId, tagRef, tagHomeId, charge) {
    const result = await pool.query(
      `INSERT INTO Passes (timestamp, TollID, tagRef, tagHomeID, charge)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [timestamp, tollId, tagRef, tagHomeId, charge]
    );
    return result.rows[0];
  }
}

class Operator {
  static async getAllOperators() {
    const result = await pool.query("SELECT * FROM Operators");
    return result.rows;
  }

  static async getOperator(operatorId) {
    const result = await pool.query(
      "SELECT * FROM Operators WHERE OperatorID = $1",
      [operatorId]
    );
    return result.rows[0];
  }
}

class Debt {
  static async updateDebtFromPass(tollOperatorId, tagOperatorId, charge) {
    try {
      // Update existing debt
      await pool.query(
        `UPDATE Debts 
           SET Amount = Amount + $3 
           WHERE FromOperatorID = $1 AND ToOperatorID = $2`,
        [tagOperatorId, tollOperatorId, charge]
      );

      // Add logging to debug
      /*
      const result = await pool.query(
        `SELECT Amount FROM Debts 
         WHERE FromOperatorID = $1 AND ToOperatorID = $2`,
        [tagOperatorId, tollOperatorId]
      );
      console.log(
        `Updated debt from ${tagOperatorId} to ${tollOperatorId} with charge ${charge}. New amount: ${result.rows[0]?.Amount}`
      );
      */
    } catch (error) {
      throw error;
    }
  }

  static async reconcileDebts() {
    try {
      // Find all pairs of operators with mutual debts
      const mutualDebts = await pool.query(`
        SELECT 
          d1.FromOperatorID as op1,
          d1.ToOperatorID as op2,
          d1.Amount as op1_owes_op2,
          d2.Amount as op2_owes_op1
        FROM Debts d1
        JOIN Debts d2 ON 
          d1.FromOperatorID = d2.ToOperatorID AND
          d1.ToOperatorID = d2.FromOperatorID
        WHERE d1.FromOperatorID < d2.FromOperatorID
      `);

      // Process each pair
      for (const debt of mutualDebts.rows) {
        const netAmount = debt.op1_owes_op2 - debt.op2_owes_op1;

        if (netAmount > 0) {
          // op1 owes op2 the net amount
          await pool.query(
            `UPDATE Debts 
             SET Amount = $1 
             WHERE FromOperatorID = $2 AND ToOperatorID = $3`,
            [netAmount, debt.op1, debt.op2]
          );
          await pool.query(
            `UPDATE Debts 
             SET Amount = $3
             WHERE FromOperatorID = $1 AND ToOperatorID = $2`,
            [debt.op2, debt.op1, 0]
          );
        } else if (netAmount < 0) {
          // op2 owes op1 the net amount
          await pool.query(
            `UPDATE Debts 
             SET Amount = $1 
             WHERE FromOperatorID = $2 AND ToOperatorID = $3`,
            [Math.abs(netAmount), debt.op2, debt.op1]
          );
          await pool.query(
            `UPDATE Debts 
             SET Amount = $3
             WHERE FromOperatorID = $1 AND ToOperatorID = $2`,
            [debt.op1, debt.op2, 0]
          );
        } else {
          // Debts cancel out - delete both records
          await pool.query(
            `UPDATE Debts 
             SET Amount = $3
             WHERE (FromOperatorID = $1 AND ToOperatorID = $2)
             OR (FromOperatorID = $2 AND ToOperatorID = $1)`,
            [debt.op1, debt.op2, 0]
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  TollStation,
  Pass,
  Operator,
  Debt,
};
