const { exec } = require("child_process");
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../cli.js");

function runCLI(command) {
  return new Promise((resolve, reject) => {
    exec(`node ${CLI_PATH} ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function parseCSV(csvData) {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};

    headers.forEach((header, index) => {
      obj[header.trim()] = values[index].trim();
    });

    return obj;
  });
}

describe("CLI Functional Tests", () => {
  jest.setTimeout(10000);

  test("Healthcheck returns system status", async () => {
    const output = await runCLI("healthcheck --format json");
    const result = JSON.parse(output);
    expect(result.status).toBeDefined();
    expect(result.status).toBe("OK");
  });

  test("Login with valid credentials", async () => {
    const output = await runCLI(
      "login --username admin --passw freepasses4all"
    );
    const parsedOutput = parseCSV(output);
    expect(parsedOutput[0].authToken).toBeDefined();
  });

  test("Fail login with invalid credentials", async () => {
    try {
      await runCLI(
        "login --username wronguser --passw wrongpass --format json"
      );
    } catch (error) {
      expect(error).toContain("Login failed");
    }
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI(
      "tollstationpasses --station AM08 --from 20220401 --to 20220415 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI(
      "tollstationpasses --station NAO04 --from 20220401 --to 20220415 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI(
      "tollstationpasses --station NO01 --from 20220401 --to 20220415 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI(
      "tollstationpasses --station AM08 --from 20220402 --to 20220413 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI(
      "passanalysis --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Logout clears the token", async () => {
    const output = await runCLI("logout --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("success");
    expect(result.message).toBe("Logout successful");
  });
});

// Pass Analysis Tests
describe("Pass Analysis", () => {
  jest.setTimeout(10000);

  test("Retrieve pass analysis for valid operators and date range", async () => {
    const output = await runCLI(
      "passanalysis --stationop AM --tagop AM --from 20220101 --to 20250130 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Handle invalid operator IDs in pass analysis", async () => {
    try {
      await runCLI(
        "passanalysis --stationop INVALID --tagop KO --from 20220101 --to 20250430 --format json"
      );
    } catch (error) {
      expect(error).toContain("error");
    }
  });

  test("Handle invalid date range in pass analysis", async () => {
    try {
      await runCLI(
        "passanalysis --stationop AO --tagop KO --from 20220131 --to 20220430 --format json"
      );
    } catch (error) {
      expect(error).toContain("error");
    }
  });
});

// Passes Cost Tests
describe("Passes Cost", () => {
  jest.setTimeout(10000);

  test("Retrieve passes cost for valid operators and date range", async () => {
    const output = await runCLI(
      "passescost --stationop AM --tagop AM --from 20220101 --to 20250430 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Handle future date range in passes cost", async () => {
    try {
      await runCLI(
        "passescost --stationop AO --tagop KO --from 20250401 --to 20250430 --format json"
      );
    } catch (error) {
      expect(error).toContain("error");
    }
  });
});

// Charges By Operator Tests
describe("Charges By Operator", () => {
  test("Retrieve charges for valid operator and date range", async () => {
    jest.setTimeout(10000);

    const output = await runCLI(
      "chargesby --opid AM --from 20220101 --to 20250430 --format json"
    );
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Handle non-existent operator in charges", async () => {
    try {
      await runCLI(
        "chargesby --opid NONEXISTENT --from 20220401 --to 20220430 --format json"
      );
    } catch (error) {
      expect(error).toContain("error");
    }
  });
});

// Admin Commands Tests
describe("Admin Commands", () => {
  test("Fail to create user with existing username", async () => {
    try {
      await runCLI(
        "admin --usermod --username admin --passw newpass123 --format json"
      );
    } catch (error) {
      expect(error).toContain("error");
    }
  });

  test("Handle invalid CSV file for adding passes", async () => {
    try {
      await runCLI(
        "admin --addpasses --source ../testing/passes-sample.csv --format json"
      );
    } catch (error) {
      expect(error).toContain("Error");
    }
  });
});

// Format Tests
describe("Output Format", () => {
  test("Return JSON format when specified", async () => {
    const output = await runCLI(
      "tollstationpasses --station AM08 --from 20220401 --to 20220415 --format json"
    );
    expect(() => JSON.parse(output)).not.toThrow();
  });
});

// Reset Commands Tests
describe("Reset Commands", () => {
  test("Reset stations successfully", async () => {
    const output = await runCLI("resetstations --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("OK");
  });

  test("Reset passes successfully", async () => {
    const output = await runCLI("resetpasses --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("OK");
  });

  test("Handle consecutive resets", async () => {
    await runCLI("resetstations --format json");
    const output = await runCLI("resetstations --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("OK");
  });
});
