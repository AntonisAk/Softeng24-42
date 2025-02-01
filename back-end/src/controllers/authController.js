const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const stringify = require("csv-stringify");

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ error: "Not Authorized" });
    }
    // Check if username already exists
    const userExists = await pool.query(
      "SELECT UserID FROM Users WHERE Username = $1",
      [username]
    );
    if (userExists.rowCount > 0) {
      return res.status(400).json({ status: "error" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const result = await pool.query(
      "INSERT INTO Users (Username, Password, Role) VALUES ($1, $2, $3) RETURNING UserID, Username, Role",
      [username, hashedPassword, "user"] // Default role as "user"
    );

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error" });
  }
};

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
      { id: user.userid, role: user.role, username: user.username },
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

const users = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ error: "Not Authorized" });
    }
    // Insert new user into the database
    const result = await pool.query("SELECT Username FROM Users");
    const usernames = result.rows.map((row) => row.username);
    const csvData = `Usernames\n${usernames
      .map((username) => `${username}\n`)
      .join("")}`;
    res.send(csvData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error" });
  }
};

module.exports = {
  login,
  logout,
  register,
  users,
};
