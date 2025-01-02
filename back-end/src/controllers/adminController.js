const { TollStation, Pass, Operator } = require("../models");
const { importStations, importPasses } = require("../utils/dbMigrate");
const pool = require("../config/database");
const path = require("path");

const adminController = {
  async healthcheck(req, res) {
    try {
      const [n_stations, n_passes, n_tags] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM Tollstations"),
        pool.query("SELECT COUNT(*) FROM Passes"),
        pool.query("SELECT COUNT(DISTINCT tagRef) FROM Passes"),
      ]);

      res.json({
        status: "OK",
        dbconnection: process.env.DB_NAME,
        n_stations: parseInt(n_stations.rows[0].count),
        n_tags: parseInt(n_tags.rows[0].count),
        n_passes: parseInt(n_passes.rows[0].count),
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "failed",
        dbconnection: process.env.DB_NAME,
      });
    }
  },

  async resetStations(req, res) {
    try {
      await pool.query("TRUNCATE TABLE Tollstations CASCADE");
      await importStations(
        path.join(__dirname, "../../data/tollstations2024.csv")
      );
      res.json({ status: "OK" });
    } catch (error) {
      res.json({
        status: "failed",
        info: error.message,
      });
    }
  },

  async resetPasses(req, res) {
    try {
      await Pass.deleteAllPasses();
      res.json({ status: "OK" });
    } catch (error) {
      res.json({
        status: "failed",
        info: error.message,
      });
    }
  },

  async addPasses(req, res) {
    try {
      if (!req.file) {
        // the uplaoded file has to have key/name file in reqbody
        throw new Error("No file uploaded");
      }
      await importPasses(req.file.path);
      res.json({ status: "OK" });
    } catch (error) {
      res.json({
        status: "failed",
        info: error.message,
      });
    }
  },
};

module.exports = adminController;
