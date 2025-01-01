// to run the script use: node src/scripts/initEmptyDb.js if in the backend directory
require("dotenv").config();
const { createTables } = require("../utils/dbMigrate");
const path = require("path");

async function initializeEmptyDatabase() {
  try {
    // Create all tables
    await createTables();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeEmptyDatabase();
}

module.exports = initializeEmptyDatabase;
