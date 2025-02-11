// to run the script use: node src/scripts/startDb.js if in the backend directory
require("dotenv").config();
const {
  createTables,
  createDatabase,
  prepForTest,
} = require("../utils/dbMigrate");
const path = require("path");

async function initializeDatabase() {
  try {
    // Create all tables
    await createDatabase();
    await createTables();
    await prepForTest();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
