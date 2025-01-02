const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { upload } = require("../middleware/upload");

router.get("/healthcheck", adminController.healthcheck);
router.post("/resetstations", adminController.resetStations);
router.post("/resetpasses", adminController.resetPasses);
router.post("/addpasses", upload.single("file"), adminController.addPasses); // the uplaoded file has to have key/name file in reqbody

module.exports = router;
