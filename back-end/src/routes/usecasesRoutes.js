const express = require("express");
const router = express.Router();
const {
  getOperatorDebts,
  processPayment,
} = require("../controllers/usecasesController");
const auth = require("../middleware/auth");

router.get("/debts", auth, getOperatorDebts);
router.post("/debts/pay", auth, processPayment);

module.exports = router;
