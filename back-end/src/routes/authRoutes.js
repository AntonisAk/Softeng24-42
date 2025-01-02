const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/login", login); // then the frontend should store the token in localstorage and attach it to the head of every request.
router.post("/logout", auth, logout);

module.exports = router;
