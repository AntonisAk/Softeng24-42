const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  register,
  users,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

router.get("/users", users);
router.post("/register", register);
router.post("/login", login); // then the frontend should store the token in localstorage and attach it to the head of every request.
router.post("/logout", auth, logout); // will be handled in the frontend

module.exports = router;
