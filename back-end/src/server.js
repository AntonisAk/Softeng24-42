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
const fs = require("fs");
const https = require("https");
const app = require("./app");

// Load the SSL certificate and private key
const sslOptions = {
  key: fs.readFileSync(__dirname + "/key.pem"), // Path to your private key
  cert: fs.readFileSync(__dirname + "/cert.pem"), // Path to your certificate
};

const PORT = process.env.PORT || 9115;

// Create the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
});

