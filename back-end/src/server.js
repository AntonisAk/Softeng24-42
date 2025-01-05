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
