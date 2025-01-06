const express = require("express");
const router = express.Router();
const tollController = require("../controllers/tollController");
const validate = require("../middleware/validate");
const schemas = require("../utils/validation");
const auth = require("../middleware/auth");

router.get(
  "/:tollStationID/:date_from/:date_to",
  auth,
  validate(schemas.stationDateParams, "params"),
  validate(schemas.formatQuery, "query"),
  tollController.getStationPasses
);

module.exports = router;
