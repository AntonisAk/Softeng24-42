const express = require("express");
const router = express.Router();
const {
  getOperatorDebts,
  processPayment,
  getCrossOperatorStats,
  getTrafficStats,
} = require("../controllers/usecasesController");
const auth = require("../middleware/auth");

router.get("/debts", auth, getOperatorDebts);
router.post("/debts/pay", auth, processPayment);
router.get("/crossop/:opid", auth, getCrossOperatorStats);
router.get("/traffic", auth, getTrafficStats);

module.exports = router;
