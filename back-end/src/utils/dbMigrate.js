const pool = require("../config/database");
const { Debt } = require("../models");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

async function createTables() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        UserID SERIAL PRIMARY KEY,
        Role VARCHAR(20) NOT NULL,
        Username VARCHAR(20) UNIQUE NOT NULL,
        Password VARCHAR(30) NOT NULL,
        Email VARCHAR(20)
      );
    `);

    // Create Operators table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Operators (
        OperatorID VARCHAR(10) PRIMARY KEY,
        Name VARCHAR(50) NOT NULL
      );
    `);

    // Create Operating_User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Operating_User (
        OperatorID VARCHAR(10) REFERENCES Operators(OperatorID),
        UserID INTEGER REFERENCES Users(UserID),
        PRIMARY KEY (OperatorID, UserID)
      );
    `);

    // Create Tollstations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Tollstations (
        TollID VARCHAR(10) PRIMARY KEY,
        OperatorID VARCHAR(10) REFERENCES Operators(OperatorID),
        Name VARCHAR(100) NOT NULL,
        PM VARCHAR(20),
        Locality VARCHAR(50),
        Road VARCHAR(50),
        Lat DECIMAL(9,6),
        Long DECIMAL(9,6),
        Email VARCHAR(50)
      );
    `);

    // Create Passes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Passes (
        PassID SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        TollID VARCHAR(10) REFERENCES Tollstations(TollID),
        tagRef VARCHAR(20) NOT NULL,
        tagHomeID VARCHAR(10) NOT NULL,
        charge DECIMAL(10,2) NOT NULL,
        CONSTRAINT valid_charge CHECK (charge >= 0)
      );
    `);

    // Create Debts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Debts (
        DebtID SERIAL PRIMARY KEY,
        FromOperatorID VARCHAR(10) REFERENCES Operators(OperatorID),
        ToOperatorID VARCHAR(10) REFERENCES Operators(OperatorID),
        Amount DECIMAL(10,2) NOT NULL,
        CONSTRAINT valid_amount CHECK (Amount >= 0)
      );
    `);

    await client.query("COMMIT");
    console.log("Tables created successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function importStations(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: (header) => header.map((col) => col.trim()),
    skip_empty_lines: true,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const record of records) {
      await client.query(
        "INSERT INTO Operators (OperatorID, Name) VALUES ($1, $2) ON CONFLICT (OperatorID) DO NOTHING",
        [record.OpID, record.Operator]
      );
    }

    // Then insert stations
    for (const record of records) {
      await client.query(
        `INSERT INTO Tollstations (TollID, OperatorID, Name, PM, Locality, Road, Lat, Long, Email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (TollID) DO UPDATE SET
         OperatorID = $2, Name = $3, PM = $4, Locality = $5, Road = $6, 
         Lat = $7, Long = $8, Email = $9`,
        [
          record.TollID,
          record.OpID,
          record.Name,
          record.PM,
          record.Locality,
          record.Road,
          record.Lat,
          record.Long,
          record.Email,
        ]
      );
    }

    // Insert all combinations of operators into the Debts table with Amount = 0
    await client.query(`
      INSERT INTO Debts (FromOperatorID, ToOperatorID, Amount)
      SELECT op1.OperatorID AS FromOperatorID, op2.OperatorID AS ToOperatorID, 0 AS Amount
      FROM Operators op1
      CROSS JOIN Operators op2
      WHERE op1.OperatorID <> op2.OperatorID; -- Exclude self-debts
    `);

    await client.query("COMMIT");
    console.log("Stations imported successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function importPasses(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: (header) => header.map((col) => col.trim()),
    skip_empty_lines: true,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const record of records) {
      const stationResult = await client.query(
        `SELECT OperatorID FROM Tollstations WHERE TollID = $1`,
        [record.tollID]
      );
      const tollOperatorId = stationResult.rows[0].OperatorID;

      await client.query(
        `INSERT INTO Passes (timestamp, TollID, tagRef, tagHomeID, charge)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          record.timestamp,
          record.tollID,
          record.tagRef,
          record.tagHomeID,
          record.charge,
        ]
      );

      if (tollOperatorId !== record.tagHomeID) {
        await Debt.updateDebtFromPass(
          tollOperatorId,
          record.tagHomeID,
          record.charge
        );
      }
    }

    await Debt.reconcileDebts();

    await client.query("COMMIT");
    console.log("Passes imported successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createTables,
  importStations,
  importPasses,
};
