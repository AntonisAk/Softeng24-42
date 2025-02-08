const express = require("express");
const router = express.Router();
const {
  getOperatorDebts,
  processPayment,
  getCrossOperatorStats,
  getTrafficStats,
  getOperators,
  getOperatorsWithStations, // Import the new function
} = require("../controllers/usecasesController");
const auth = require("../middleware/auth");

router.get("/debts", auth, getOperatorDebts);
router.post("/debts/pay", auth, processPayment);
router.get("/crossop/:opid", auth, getCrossOperatorStats);
router.get("/traffic", auth, getTrafficStats);
router.get("/operators", auth, getOperators);
router.get("/operators-with-stations", auth, getOperatorsWithStations); // New route

module.exports = router;
