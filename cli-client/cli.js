#!/usr/bin/env node

const axios = require("axios");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const FormData = require("form-data");
//const https = require("https");

// Configuration
// const BASE_URL = "https://localhost:9115/api";
const BASE_URL = "http://localhost:9115/api";
let authToken = null;

// Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: false,
  /*httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates
  }),*/
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers["X-OBSERVATORY-AUTH"] = authToken;
  }
  return config;
});

// Helper function to format response based on format flag
const formatResponse = (data, format = "csv") => {
  if (format === "json") {
    return JSON.stringify(data, null, 2);
  }

  // Convert to CSV
  if (!data || typeof data !== "object") return "";

  // Handle different response structures
  if (Array.isArray(data)) {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => row[header]).join(",")),
    ].join("\n");
    return csv;
  } else {
    const entries = Object.entries(data).map(
      ([key, value]) => `${key},${value}`
    );
    return entries.join("\n");
  }
};

// Command handlers
const handlers = {
  async healthcheck() {
    const response = await api.get("/admin/healthcheck");
    return response.data;
  },

  async resetpasses() {
    const response = await api.post("/admin/resetpasses");
    return response.data;
  },

  async resetstations() {
    const response = await api.post("/admin/resetstations");
    return response.data;
  },

  async login(argv) {
    const response = await api.post("/login", {
      username: argv.username,
      password: argv.passw,
    });

    if (response.data.token) {
      authToken = response.data.token;
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

/*
.option('format', {
    describe: 'Output format',
    choices: ['json', 'csv'],
    default: 'csv'
})
.help()
.argv;
*/

// Main CLI setup
yargs(hideBin(process.argv))
  .command("healthcheck", "Check system health", {}, async (argv) => {
    const result = await handlers.healthcheck();
    console.log(formatResponse(result, argv.format));
  })
  .command("resetpasses", "Reset passes in the system", {}, async (argv) => {
    const result = await handlers.resetpasses();
    console.log(formatResponse(result, argv.format));
  })
  .command(
    "resetstations",
    "Reset stations in the system",
    {},
    async (argv) => {
      const result = await handlers.resetstations();
      console.log(formatResponse(result, argv.format));
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
      console.log(formatResponse(result, argv.format));
    }
  )
  .command("logout", "Logout from the system", {}, async (argv) => {
    const result = await handlers.logout();
    console.log(formatResponse(result, argv.format));
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
      console.log(formatResponse(result, argv.format));
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
      console.log(formatResponse(result, argv.format));
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
      console.log(formatResponse(result, argv.format));
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
      console.log(formatResponse(result, argv.format));
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
          console.log(formatResponse(response.data, argv.format));
        } else if (argv.users) {
          const response = await api.get("//users");
          console.log(formatResponse(response.data, argv.format));
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
          });
          console.log(formatResponse(response.data, argv.format));
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
