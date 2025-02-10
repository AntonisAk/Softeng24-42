const request = require("supertest");
const app = require("../src/app");
const {
  testPool,
  setupTestDb,
  cleanTestDb,
  generateTestToken,
  insertTestData,
} = require("./setup");
const path = require("path");

describe("Admin Endpoints", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    await cleanTestDb();
    await insertTestData();
  });

  describe("GET /admin/healthcheck", () => {
    it("should return system health status in JSON format", async () => {
      const res = await request(app)
        .get("/api/admin/healthcheck")
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
        dbconnection: expect.any(String),
        n_stations: expect.any(Number),
        n_tags: expect.any(Number),
        n_passes: expect.any(Number),
      });
    });

    it("should return system health status in CSV format", async () => {
      const res = await request(app)
        .get("/api/admin/healthcheck")
        .query({ format: "csv" });

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(
        "status,dbconnection,n_stations,n_tags,n_passes"
      );
      expect(res.headers["content-type"]).toContain("text/csv");
    });
  });

  describe("POST /admin/resetstations", () => {
    it("should reset stations successfully", async () => {
      const res = await request(app)
        .post("/api/admin/resetstations")
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
      });

      // Verify stations were reset
      const stations = await testPool.query(
        "SELECT COUNT(*) FROM Tollstations"
      );
      expect(parseInt(stations.rows[0].count)).toBeGreaterThan(0);
    });
  });

  describe("POST /admin/resetpasses", () => {
    it("should reset passes and debts successfully", async () => {
      const res = await request(app)
        .post("/api/admin/resetpasses")
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
      });

      // Verify passes were reset
      const passes = await testPool.query("SELECT COUNT(*) FROM Passes");
      expect(parseInt(passes.rows[0].count)).toBe(0);

      // Verify debts were reset
      const debts = await testPool.query("SELECT SUM(amount) FROM Debts");
      expect(parseFloat(debts.rows[0].sum) || 0).toBe(0);
    });
  });

  describe("POST /admin/addpasses", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/admin/addpasses")
        .query({ format: "json" });

      expect(res.statusCode).toBe(401);
    });

    it("should require admin role", async () => {
      const token = generateTestToken({
        id: 2,
        role: "user",
        username: "user",
      });

      const res = await request(app)
        .post("/api/admin/addpasses")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe("Not Authorized, only for admin");
    });

    it("should add passes successfully with valid CSV file", async () => {
      const token = generateTestToken({
        id: 1,
        role: "admin",
        username: "admin",
      });

      const res = await request(app)
        .post("/api/admin/addpasses")
        .set("X-OBSERVATORY-AUTH", token)
        .attach("file", path.join(__dirname, "./data/test_sample.csv"))
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
      });

      // Verify passes were added
      const passes = await testPool.query("SELECT COUNT(*) FROM Passes");
      expect(parseInt(passes.rows[0].count)).toBeGreaterThan(0);
    });

    it("should fail when no file is uploaded", async () => {
      const token = generateTestToken({
        id: 1,
        role: "admin",
        username: "admin",
      });

      const res = await request(app)
        .post("/api/admin/addpasses")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(200); // Your current implementation returns 200
      expect(res.body).toEqual({
        status: "failed",
        info: "No file uploaded",
      });
    });
  });
});
