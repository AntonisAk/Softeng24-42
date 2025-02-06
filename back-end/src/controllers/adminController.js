const { TollStation, Pass, Operator } = require("../models");
const { importStations, importPasses } = require("../utils/dbMigrate");
const pool = require("../config/database");
const path = require("path");
const { formatResponse, getContentType } = require("../utils/formatResponse");
const bcrypt = require("bcrypt");

const adminController = {
  async healthcheck(req, res) {
    try {
      const [n_stations, n_passes, n_tags] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM Tollstations"),
        pool.query("SELECT COUNT(*) FROM Passes"),
        pool.query("SELECT COUNT(DISTINCT tagRef) FROM Passes"),
      ]);

      const format = req.query.format || "json";

      const response = {
        status: "OK",
        dbconnection: process.env.DB_NAME,
        n_stations: parseInt(n_stations.rows[0].count),
        n_tags: parseInt(n_tags.rows[0].count),
        n_passes: parseInt(n_passes.rows[0].count),
      };

      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
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
      const format = req.query.format || "json";
      const response = { status: "OK" };
      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
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
      await pool.query("UPDATE Debts SET amount = $1", [0]);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("freepasses4all", salt);
      await pool.query(
        `INSERT INTO USERS (username, password, role) VALUES ($1, $2, $3)`,
        ["admin", hashedPassword, "admin"]
      );
      const format = req.query.format || "json";
      const response = { status: "OK" };
      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
    } catch (error) {
      res.json({
        status: "failed",
        info: error.message,
      });
    }
  },

  async addPasses(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(401)
          .json({ error: "Not Authorized, only for admin" });
      }
      if (!req.file) {
        // the uplaoded file has to have key/name file in reqbody
        throw new Error("No file uploaded");
      }
      await importPasses(req.file.path);
      const format = req.query.format || "json";
      const response = { status: "OK" };
      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
    } catch (error) {
      res.json({
        status: "failed",
        info: error.message,
      });
    }
  },
};

module.exports = adminController;
