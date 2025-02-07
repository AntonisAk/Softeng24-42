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
  static async updateDebtFromPass(passRecords) {
    try {
      const updateQuery = `
        WITH new_passes AS (
          SELECT 
            t.OperatorID as toll_operator_id,
            p.tagHomeID,
            p.charge
          FROM UNNEST ($1::varchar[], $2::varchar[], $3::decimal[]) 
            AS p(tollID, tagHomeID, charge)
          JOIN Tollstations t ON t.TollID = p.tollID
          WHERE t.OperatorID != p.tagHomeID
        )
        UPDATE Debts d
        SET Amount = d.Amount + pass_totals.total_charge
        FROM (
          SELECT 
            tagHomeID as from_operator,
            toll_operator_id as to_operator,
            SUM(charge) as total_charge
          FROM new_passes
          GROUP BY tagHomeID, toll_operator_id
        ) pass_totals
        WHERE 
          d.FromOperatorID = pass_totals.from_operator 
          AND d.ToOperatorID = pass_totals.to_operator`;

      // Extract arrays for the query parameters
      const tollIds = passRecords.map((r) => r.tollID);
      const tagHomeIds = passRecords.map((r) => r.tagHomeID);
      const charges = passRecords.map((r) => r.charge);

      await pool.query(updateQuery, [tollIds, tagHomeIds, charges]);
    } catch (error) {
      throw error;
    }
  }

  static async reconcileDebts() {
    try {
      await pool.query(`
        WITH mutual_debts AS (
          SELECT 
            d1.FromOperatorID as op1,
            d1.ToOperatorID as op2,
            d1.Amount as op1_owes_op2,
            d2.Amount as op2_owes_op1,
            d1.Amount - d2.Amount AS netAmount
          FROM Debts d1
          JOIN Debts d2 ON 
            d1.FromOperatorID = d2.ToOperatorID AND
            d1.ToOperatorID = d2.FromOperatorID
          WHERE d1.FromOperatorID < d2.FromOperatorID
      )
      UPDATE Debts
      SET Amount = CASE 
          -- When op1 owes more to op2
          WHEN (Debts.FromOperatorID = mutual_debts.op1 AND 
                Debts.ToOperatorID = mutual_debts.op2 AND 
                netAmount > 0) THEN netAmount
          -- When op2 owes more to op1
          WHEN (Debts.FromOperatorID = mutual_debts.op2 AND 
                Debts.ToOperatorID = mutual_debts.op1 AND 
                netAmount < 0) THEN ABS(netAmount)
          -- All other cases (including when debts cancel out)
          ELSE 0
        END
      FROM mutual_debts
      WHERE (Debts.FromOperatorID = mutual_debts.op1 AND Debts.ToOperatorID = mutual_debts.op2)
        OR (Debts.FromOperatorID = mutual_debts.op2 AND Debts.ToOperatorID = mutual_debts.op1);
      `);
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
