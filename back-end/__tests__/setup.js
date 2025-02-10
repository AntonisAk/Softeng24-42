// __tests__/setup.js
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

// Test database configuration
const testPool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || "interpay_test",
});

// Helper function to setup test database
async function setupTestDb() {
  // Create necessary tables
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID SERIAL PRIMARY KEY,
      Username VARCHAR(50) UNIQUE NOT NULL,
      Password VARCHAR(255) NOT NULL,
      Role VARCHAR(20) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Operators (
      OperatorID VARCHAR(20) PRIMARY KEY,
      Name VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Tollstations (
      TollID VARCHAR(20) PRIMARY KEY,
      OperatorID VARCHAR(20) REFERENCES Operators(OperatorID),
      Name VARCHAR(100),
      PM VARCHAR(20),
      Locality VARCHAR(50),
      Road VARCHAR(50),
      Lat DECIMAL(9,6),
      Long DECIMAL(9,6),
      Email VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS Passes (
      PassID SERIAL PRIMARY KEY,
      Timestamp TIMESTAMP NOT NULL,
      TollID VARCHAR(20) REFERENCES Tollstations(TollID),
      TagRef VARCHAR(100) NOT NULL,
      TagHomeID VARCHAR(20) REFERENCES Operators(OperatorID),
      Charge DECIMAL(10,2) NOT NULL,
      CONSTRAINT valid_charge CHECK (charge >= 0),
      CONSTRAINT unique_pass UNIQUE (timestamp, TollID, tagRef, tagHomeID)
    );

    CREATE TABLE IF NOT EXISTS Debts (
      FromOperatorID VARCHAR(20) REFERENCES Operators(OperatorID),
      ToOperatorID VARCHAR(20) REFERENCES Operators(OperatorID),
      Amount DECIMAL(10,2) DEFAULT 0,
      PRIMARY KEY (FromOperatorID, ToOperatorID)
    );
  `);
}

// Helper function to clean test database
async function cleanTestDb() {
  await testPool.query(`
    TRUNCATE TABLE Passes CASCADE;
    TRUNCATE TABLE Tollstations CASCADE;
    TRUNCATE TABLE Operators CASCADE;
    TRUNCATE TABLE Users CASCADE;
    TRUNCATE TABLE Debts CASCADE;
  `);
}

// Helper function to close all connections
async function closeAllPools() {
  try {
    await testPool.end();
  } catch (error) {
    console.error("Error closing pools:", error);
  }
}

// Helper function to generate test JWT token
function generateTestToken(
  user = { id: 1, role: "admin", username: "testadmin" }
) {
  return jwt.sign(user, process.env.JWT_SECRET || "test-secret");
}

// Helper function to insert test data
async function insertTestData() {
  // Insert test operators
  await testPool.query(`
    INSERT INTO Operators (OperatorID, Name) VALUES
    ('AO', 'Alpha Operator'),
    ('BO', 'Beta Operator'),
    ('GO', 'Gamma Operator')
  `);

  // Insert test toll stations
  await testPool.query(`
    INSERT INTO Tollstations (TollID, OperatorID) VALUES
    ('ST1', 'AO'),
    ('ST2', 'BO'),
    ('ST3', 'GO')
  `);

  // Insert test user
  await testPool.query(`
    INSERT INTO Users (Username, Password, Role) VALUES
    ('testadmin', '$2b$10$test_hash', 'admin')
  `);
}

module.exports = {
  testPool,
  setupTestDb,
  cleanTestDb,
  generateTestToken,
  insertTestData,
};
