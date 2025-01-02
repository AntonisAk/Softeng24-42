// to run the script use: node src/scripts/initDb.js if in the backend directory
require("dotenv").config();
const {
  createTables,
  importStations,
  importPasses,
  dropTables,
} = require("../utils/dbMigrate");
const path = require("path");

async function initializeDatabase() {
  try {
    // Create all tables
    await dropTables();
    await createTables();

    // Import stations and passes from CSV
    const stationsPath = path.join(
      __dirname,
      "../../data/tollstations2024.csv"
    );
    await importStations(stationsPath);

    const passesPath = path.join(__dirname, "../../data/passes-sample.csv");
    await importPasses(passesPath);

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
