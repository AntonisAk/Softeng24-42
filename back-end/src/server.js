// require("dotenv").config();
// const express = require("express");  // Εισάγουμε την βιβλιοθήκη express
// const path = require("path");       // Εισάγουμε το path για να δουλέψουμε με διαδρομές
// const app = require("./app");

// const PORT = process.env.PORT || 9115;

// // Serve React static files
// app.use(express.static(path.join(__dirname, "../../front-end/interpaytoll")));

// // Route για την εξυπηρέτηση του React frontend
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../front-end/interpaytoll", "index.html"));
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 9115;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

