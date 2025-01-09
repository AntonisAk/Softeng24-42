const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const tollRoutes = require("./routes/tollRoutes");
const passRoutes = require("./routes/passRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/tollStationPasses", tollRoutes);
app.use("/api", passRoutes); // Will contain passAnalysis, passesCost, and chargesBy
app.use("/api", authRoutes); // add the following to .env JWT_SECRET=your_jwt_secret_here

// Global error handler
app.use(errorHandler);

module.exports = app;
