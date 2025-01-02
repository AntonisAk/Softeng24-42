const { TollStation, Pass } = require("../models");
const { formatResponse, getContentType } = require("../utils/formatResponse");

const tollController = {
  async getStationPasses(req, res) {
    try {
      const { tollStationID, date_from, date_to } = req.params;
      const format = req.query.format || "json";

      const dateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
        4,
        6
      )}-${date_from.slice(6, 8)}`;
      const dateTo = `${date_to.slice(0, 4)}-${date_to.slice(
        4,
        6
      )}-${date_to.slice(6, 8)}`;

      const station = await TollStation.getStation(tollStationID);
      const passes = await Pass.getPassesByStation(
        tollStationID,
        dateFrom,
        dateTo
      );

      const response = {
        stationID: station.tollid,
        stationOperator: station.operatorid,
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
          timestamp: pass.timestamp
            .toISOString()
            .replace("T", " ")
            .slice(0, 16),
          tagID: pass.tagref,
          tagProvider: pass.taghomeid,
          passType: pass.taghomeid === station.operatorid ? "home" : "visitor",
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
};

module.exports = tollController;
