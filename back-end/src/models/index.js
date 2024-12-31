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
       WHERE t.OperatorID = $1 
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

module.exports = {
  TollStation,
  Pass,
  Operator,
};
