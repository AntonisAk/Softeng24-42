const { Pool } = require("pg");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
}); // to locate the .env file which is 2 levels up

const isTestEnv = process.env.NODE_ENV === "test"; // when testing use the database test

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: isTestEnv ? process.env.TEST_DB_NAME : process.env.DB_NAME, // Switch databases
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
if (!isTestEnv) {
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Database connection error:", err);
    } else {
      console.log(
        `Connected to ${isTestEnv ? "TEST" : "DEVELOPMENT"} database`
      );
    }
  });
}

module.exports = pool;
