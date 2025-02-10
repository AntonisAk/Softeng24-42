#!/usr/bin/env node

const TOKEN_FILE = ".auth_token"; // to store token when user logs in

const axios = require("axios");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const FormData = require("form-data");
const { stringify } = require("csv-stringify/sync");
const https = require("https");

// Configuration
const BASE_URL = "https://localhost:9115/api";
let authToken = null;

// Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: false,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates
  }),
});

// Load token if it exists
if (fs.existsSync(TOKEN_FILE)) {
  authToken = fs.readFileSync(TOKEN_FILE, "utf8");
}

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers["X-OBSERVATORY-AUTH"] = authToken;
  }
  return config;
});

function formatResponse(data, format = "csv") {
  if (format === "csv") {
    if (!Array.isArray(data)) {
      // Convert single object to array for CSV conversion
      data = [data];
    }
    return stringify(data, {
      header: true,
      delimiter: ",",
    });
  }
  return data;
}

// Command handlers
const handlers = {
  async healthcheck(argv) {
    const response = await api.get("/admin/healthcheck", {
      params: { format: argv.format },
    });
    return response.data;
  },

  async resetpasses(argv) {
    const response = await api.post("/admin/resetpasses", {
      params: { format: argv.format },
    });
    return response.data;
  },

  async resetstations(argv) {
    const response = await api.post("/admin/resetstations", {
      params: { format: argv.format },
    });
    return response.data;
  },

  async login(argv) {
    const response = await api.post("/login", {
      username: argv.username,
      password: argv.passw,
    });

    if (response.data.token) {
      authToken = response.data.token;
      fs.writeFileSync(TOKEN_FILE, authToken, "utf8");
      return { authToken };
    }
    return { status: "error", message: "Login failed" };
  },

  async logout() {
    if (!authToken) {
      return { status: "error", message: "Not logged in" };
    }
    const response = await api.post("/logout");
    authToken = null;
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE); // Delete the token file
    }
    return { status: "success", message: "Logout successful" };
  },

  async tollstationpasses(argv) {
    const response = await api.get(
      `/tollStationPasses/${argv.station}/${argv.from}/${argv.to}`,
      { params: { format: argv.format } }
    );
    return response.data;
  },

  async passanalysis(argv) {
    const response = await api.get(
      `/passAnalysis/${argv.stationop}/${argv.tagop}/${argv.from}/${argv.to}`,
      { params: { format: argv.format } }
    );
    return response.data;
  },

  async passescost(argv) {
    const response = await api.get(
      `/passesCost/${argv.stationop}/${argv.tagop}/${argv.from}/${argv.to}`,
      { params: { format: argv.format } }
    );
    return response.data;
  },

  async chargesby(argv) {
    const response = await api.get(
      `/chargesBy/${argv.opid}/${argv.from}/${argv.to}`,
      { params: { format: argv.format } }
    );
    return response.data;
  },
};

// Main CLI setup
yargs(hideBin(process.argv))
  .command("healthcheck", "Check system health", {}, async (argv) => {
    const result = await handlers.healthcheck(argv);
    if (argv.format === "json") {
      console.log(JSON.stringify(result, null, 2));  
    } else {
      console.log(result);
    }
  })
  .command("resetpasses", "Reset passes in the system", {}, async (argv) => {
    const result = await handlers.resetpasses(argv);
    if (argv.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatResponse(result, argv.format));
    }
  })
  .command(
    "resetstations",
    "Reset stations in the system",
    {},
    async (argv) => {
      const result = await handlers.resetstations(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatResponse(result, argv.format));
      }
    }
  )
  .command(
    "login",
    "Login to the system",
    {
      username: {
        describe: "Username",
        demandOption: true,
        type: "string",
      },
      passw: {
        describe: "Password",
        demandOption: true,
        type: "string",
      },
    },
    async (argv) => {
      const result = await handlers.login(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatResponse(result, argv.format));
      }
    }
  )
  .command("logout", "Logout from the system", {}, async (argv) => {
    const result = await handlers.logout();
    if (argv.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatResponse(result, argv.format));
    }
  })
  .command(
    "tollstationpasses",
    "Get passes for a toll station",
    {
      station: {
        describe: "Station ID",
        demandOption: true,
        type: "string",
      },
      from: {
        describe: "Start date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
      to: {
        describe: "End date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
    },
    async (argv) => {
      const result = await handlers.tollstationpasses(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }
  )
  .command(
    "passanalysis",
    "Get pass analysis",
    {
      stationop: {
        describe: "Station operator ID",
        demandOption: true,
        type: "string",
      },
      tagop: {
        describe: "Tag operator ID",
        demandOption: true,
        type: "string",
      },
      from: {
        describe: "Start date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
      to: {
        describe: "End date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
    },
    async (argv) => {
      const result = await handlers.passanalysis(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }
  )
  .command(
    "passescost",
    "Get passes cost between operators",
    {
      stationop: {
        describe: "Station operator ID",
        demandOption: true,
        type: "string",
      },
      tagop: {
        describe: "Tag operator ID",
        demandOption: true,
        type: "string",
      },
      from: {
        describe: "Start date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
      to: {
        describe: "End date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
    },
    async (argv) => {
      const result = await handlers.passescost(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }
  )
  .command(
    "chargesby",
    "Get charges by operator",
    {
      opid: {
        describe: "Operator ID",
        demandOption: true,
        type: "string",
      },
      from: {
        describe: "Start date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
      to: {
        describe: "End date (YYYYMMDD)",
        demandOption: true,
        type: "string",
      },
    },
    async (argv) => {
      const result = await handlers.chargesby(argv);
      if (argv.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }
  )
  .command(
    "admin",
    "Administrative commands",
    {
      usermod: {
        describe: "Create user",
        type: "boolean",
      },
      users: {
        describe: "List users",
        type: "boolean",
      },
      addpasses: {
        describe: "Add passes from CSV file",
        type: "boolean",
      },
      username: {
        describe: "Username for user modification",
        type: "string",
      },
      passw: {
        describe: "Password for user modification",
        type: "string",
      },
      source: {
        describe: "Source CSV file for adding passes",
        type: "string",
      },
    },
    async (argv) => {
      try {
        if (argv.usermod) {
          if (!argv.username || !argv.passw) {
            console.error(
              "Error: --username and --passw are required for --usermod"
            );
            process.exit(1);
          }
          const response = await api.post("/register", {
            username: argv.username,
            password: argv.passw,
          });
          if (argv.format === "json") {
            console.log(JSON.stringify(response.data, null, 2));
          } else {
            console.log(formatResponse(response.data, argv.format));
          }
        } else if (argv.users) {
          const response = await api.get("/users");
          if (argv.format === "json") {
            console.log(JSON.stringify(response.data, null, 2));
          } else {
            console.log(response.data);
          }
        } else if (argv.addpasses) {
          if (!argv.source) {
            console.error("Error: --source is required for --addpasses");
            process.exit(1);
          }

          if (!fs.existsSync(argv.source)) {
            console.error("Error: Source file does not exist");
            process.exit(1);
          }

          const formData = new FormData();
          formData.append("file", fs.createReadStream(argv.source), {
            filename: "passes.csv",
            contentType: "text/csv",
          });

          const response = await api.post("/admin/addpasses", formData, {
            headers: {
              ...formData.getHeaders(),
            },
            params: { format: argv.format },
          });
          if (argv.format === "json") {
            console.log(JSON.stringify(response.data, null, 2));
          } else {
            console.log(response.data);
          }
        } else {
          console.error(
            "Error: One of --usermod, --users, or --addpasses is required"
          );
          process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error.response?.data?.message || error.message);
        process.exit(1);
      }
    }
  )
  .middleware((argv) => {
    // Validate dates if they are provided
    const dateRegex = /^\d{8}$/;
    if (argv.from && !dateRegex.test(argv.from)) {
      console.error("Error: Date format should be YYYYMMDD");
      process.exit(1);
    }
    if (argv.to && !dateRegex.test(argv.to)) {
      console.error("Error: Date format should be YYYYMMDD");
      process.exit(1);
    }
    return argv;
  })
  .option("format", {
    describe: "Output format",
    choices: ["json", "csv"],
    default: "csv",
  })
  .strict() // Report errors for unknown commands/options
  .wrap(null) // Don't wrap help text
  .help()
  .alias("h", "help")
  .version("1.0.0")
  .alias("v", "version").argv;

// Add error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});
