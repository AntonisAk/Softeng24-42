const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const validate = require("../middleware/validate");
const schemas = require("../utils/validation");
const { upload } = require("../middleware/upload");

router.get(
  "/healthcheck",
  validate(schemas.formatQuery, "query"),
  adminController.healthcheck
);
router.post(
  "/resetstations",
  validate(schemas.formatQuery, "query"),
  adminController.resetStations
);
router.post(
  "/resetpasses",
  validate(schemas.formatQuery, "query"),
  adminController.resetPasses
);
router.post(
  "/addpasses",
  validate(schemas.formatQuery, "query"),
  upload.single("file"),
  adminController.addPasses
); // the uplaoded file has to have key/name file in reqbody

module.exports = router;
