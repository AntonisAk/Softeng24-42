// to run the script use: node src/scripts/initDb.js
require("dotenv").config();
const {
  createTables,
  importStations,
  importPasses,
} = require("../utils/dbMigrate");
const path = require("path");

async function initializeDatabase() {
  try {
    // Create all tables
    await createTables();

    // Import stations from CSV
    const stationsPath = path.join(
      __dirname,
      "../../data/tollstations2024.csv"
    );
    await importStations(stationsPath);

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
