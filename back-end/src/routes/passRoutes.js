const express = require("express");
const router = express.Router();
const passController = require("../controllers/passController");
const validate = require("../middleware/validate");
const schemas = require("../utils/validation");

router.get(
  "/passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to",
  validate(schemas.operatorParams, "params"),
  validate(schemas.dateParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getPassAnalysis
);

router.get(
  "/passesCost/:tollOpID/:tagOpID/:date_from/:date_to",
  validate(schemas.operatorParams, "params"),
  validate(schemas.dateParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getPassesCost
);

router.get(
  "/chargesBy/:tollOpID/:date_from/:date_to",
  validate(schemas.singleOperatorParams, "params"),
  validate(schemas.dateParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getChargesBy
);

module.exports = router;
