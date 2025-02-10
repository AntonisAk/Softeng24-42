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
    const output = await runCLI('login --username admin --passw freepasses4all');
    const parsedOutput = parseCSV(output);;
    expect(parsedOutput[0].authToken).toBeDefined();
  });

  test("Fail login with invalid credentials", async () => {
    try {
      await runCLI('login --username wronguser --passw wrongpass --format json');
    } catch (error) {
      expect(error).toContain("Login failed");
    }
  });

  test("Reset passes", async () => {
    const output = await runCLI("resetpasses --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("OK");
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI("tollstationpasses --station AM08 --from 20220401 --to 20220415 --format json");
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI("tollstationpasses --station NAO04 --from 20220401 --to 20220415 --format json");
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI("tollstationpasses --station NO01 --from 20220401 --to 20220415 --format json");
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI("tollstationpasses --station AM08 --from 20220402 --to 20220413 --format json");
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Retrieve toll station passes", async () => {
    const output = await runCLI("passanalysis --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json");
    const result = JSON.parse(output);
    expect(Array.isArray(result)).toBe(false);
  });

  test("Logout clears the token", async () => {
    const output = await runCLI("logout --format json");
    const result = JSON.parse(output);
    expect(result.status).toBe("success");
    expect(result.message).toBe("Logout successful");
  });

  test("Fail to execute command without login", async () => {
    try {
      await runCLI("resetpasses --format json");
    } catch (error) {
      expect(error).toContain("Not logged in");
    }
  });

});
