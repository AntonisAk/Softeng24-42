const { Pass, Operator } = require("../models");
const { formatResponse, getContentType } = require("../utils/formatResponse");

const passController = {
  async getPassAnalysis(req, res) {
    try {
      const { stationOpID, tagOpID, date_from, date_to } = req.params;
      const format = req.query.format || "json";

      const dateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
        4,
        6
      )}-${date_from.slice(6, 8)}`;
      const dateTo = `${date_to.slice(0, 4)}-${date_to.slice(
        4,
        6
      )}-${date_to.slice(6, 8)}`;

      const passes = await Pass.getPassesByOperators(
        stationOpID,
        tagOpID,
        dateFrom,
        dateTo
      );

      const response = {
        stationOpID,
        tagOpID,
        requestTimestamp: new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        periodFrom: dateFrom,
        periodTo: dateTo,
        nPasses: passes.length,
        passList: passes.map((pass, index) => ({
          passIndex: index + 1,
          passID: pass.passid,
          stationID: pass.tollid,
          timestamp: pass.timestamp
            .toISOString()
            .replace("T", " ")
            .slice(0, 16),
          tagID: pass.tagref,
          passCharge: parseFloat(pass.charge),
        })),
      };

      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
    } catch (error) {
      res.status(500).json({
        status: "failed",
        info: error.message,
      });
    }
  },

  async getPassesCost(req, res) {
    try {
      const { tollOpID, tagOpID, date_from, date_to } = req.params;
      const format = req.query.format || "json";

      const dateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
        4,
        6
      )}-${date_from.slice(6, 8)}`;
      const dateTo = `${date_to.slice(0, 4)}-${date_to.slice(
        4,
        6
      )}-${date_to.slice(6, 8)}`;

      const result = await Pass.getPassesCost(
        tollOpID,
        tagOpID,
        dateFrom,
        dateTo
      );

      const response = {
        tollOpID,
        tagOpID,
        requestTimestamp: new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        periodFrom: dateFrom,
        periodTo: dateTo,
        nPasses: parseInt(result.npasses),
        passesCost: parseFloat(result.totalcost),
      };

      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
    } catch (error) {
      res.status(500).json({
        status: "failed",
        info: error.message,
      });
    }
  },

  async getChargesBy(req, res) {
    try {
      const { tollOpID, date_from, date_to } = req.params;
      const format = req.query.format || "json";

      const dateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
        4,
        6
      )}-${date_from.slice(6, 8)}`;
      const dateTo = `${date_to.slice(0, 4)}-${date_to.slice(
        4,
        6
      )}-${date_to.slice(6, 8)}`;

      // Get all operators except tollOpID
      const operators = await Operator.getAllOperators();
      const visitingOperators = operators.filter(
        (op) => op.operatorid !== tollOpID
      );

      // Get charges for each visiting operator
      const vOpList = await Promise.all(
        visitingOperators.map(async (op) => {
          const result = await Pass.getPassesCost(
            tollOpID,
            op.operatorid,
            dateFrom,
            dateTo
          );
          return {
            visitingOpID: op.operatorid,
            nPasses: parseInt(result.npasses),
            passesCost: parseFloat(result.totalcost),
          };
        })
      );

      const response = {
        tollOpID,
        requestTimestamp: new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        periodFrom: dateFrom,
        periodTo: dateTo,
        vOpList: vOpList.filter((op) => op.nPasses > 0),
      };

      res.setHeader("Content-Type", getContentType(format));
      res.send(formatResponse(response, format));
    } catch (error) {
      res.status(500).json({
        status: "failed",
        info: error.message,
      });
    }
  },
};

module.exports = passController;
