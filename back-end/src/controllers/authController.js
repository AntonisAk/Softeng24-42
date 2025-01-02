const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const result = await pool.query(
      "SELECT UserID, Username, Password, Role FROM Users WHERE Username = $1",
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const logout = async (req, res) => {
  // Since we're using JWT, we don't need server-side logout
  // The client should just remove the token
  res.status(200).send();
};

module.exports = {
  login,
  logout,
};
