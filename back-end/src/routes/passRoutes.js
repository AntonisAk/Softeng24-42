const express = require("express");
const router = express.Router();
const passController = require("../controllers/passController");
const validate = require("../middleware/validate");
const schemas = require("../utils/validation");
const auth = require("../middleware/auth");

router.get(
  "/passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to",
  auth,
  validate(schemas.passAnalysisParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getPassAnalysis
);

router.get(
  "/passesCost/:tollOpID/:tagOpID/:date_from/:date_to",
  auth,
  validate(schemas.passesCostParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getPassesCost
);

router.get(
  "/chargesBy/:tollOpID/:date_from/:date_to",
  auth,
  validate(schemas.chargesByParams, "params"),
  validate(schemas.formatQuery, "query"),
  passController.getChargesBy
);

module.exports = router;
