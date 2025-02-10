// __tests__/pass.test.js
const request = require("supertest");
const app = require("../src/app");
const {
  testPool,
  setupTestDb,
  cleanTestDb,
  generateTestToken,
  insertTestData,
} = require("./setup");

describe("Pass Endpoints", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    await cleanTestDb();
    await insertTestData();

    // Insert some test passes
    await testPool.query(`
      INSERT INTO Passes (timestamp, TollID, TagRef, TagHomeID, Charge) VALUES
      ('2024-02-01 10:00:00', 'ST1', 'TAG1', 'BO', 2.50),
      ('2024-02-01 11:00:00', 'ST1', 'TAG2', 'GO', 2.50),
      ('2024-02-02 10:00:00', 'ST2', 'TAG3', 'AO', 3.00),
      ('2024-02-02 11:00:00', 'ST2', 'TAG4', 'GO', 3.00)
    `);
  });

  describe("GET /tollStationPasses/:tollStationID/:date_from/:date_to", () => {
    it("should return toll station passes for valid parameters", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/tollStationPasses/ST1/20240201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        stationID: "ST1",
        stationOperator: "AO",
        requestTimestamp: expect.any(String),
        periodFrom: "2024-02-01",
        periodTo: "2024-02-02",
        nPasses: expect.any(Number),
        passList: expect.arrayContaining([
          expect.objectContaining({
            passIndex: expect.any(Number),
            passID: expect.any(Number),
            timestamp: expect.any(String),
            tagID: expect.any(String),
            tagProvider: expect.any(String),
            passType: expect.any(String),
            passCharge: expect.any(Number),
          }),
        ]),
      });
    });

    it("should validate date format", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/tollStationPasses/ST1/20240-201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /passesAnalysis/:stationOpID/:tagOpID/:date_from/:date_to", () => {
    it("should return pass analysis for valid parameters", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/passAnalysis/AO/BO/20240201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        stationOpID: "AO",
        tagOpID: "BO",
        requestTimestamp: expect.any(String),
        periodFrom: "2024-02-01",
        periodTo: "2024-02-02",
        nPasses: expect.any(Number),
        passList: expect.arrayContaining([
          expect.objectContaining({
            passIndex: expect.any(Number),
            passID: expect.any(Number),
            stationID: expect.any(String),
            timestamp: expect.any(String),
            tagID: expect.any(String),
            passCharge: expect.any(Number),
          }),
        ]),
      });
    });

    it("should validate date format", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/passAnalysis/AO/BO/2024-02-01/2024-02-02")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /passes/cost/:tollOpID/:tagOpID/:date_from/:date_to", () => {
    it("should return passes cost for valid parameters", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/passesCost/AO/BO/20240201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        tollOpID: "AO",
        tagOpID: "BO",
        requestTimestamp: expect.any(String),
        periodFrom: "2024-02-01",
        periodTo: "2024-02-02",
        nPasses: expect.any(Number),
        passesCost: expect.any(Number),
      });
    });

    it("should return data in CSV format when requested", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/passesCost/AO/BO/20240201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "csv" });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain(
        "tollOpID,tagOpID,requestTimestamp,periodFrom,periodTo,nPasses,passesCost"
      );
    });
  });

  describe("GET /chargesby/:tollOpID/:date_from/:date_to", () => {
    it("should return charges by operator for valid parameters", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/chargesBy/AO/20240201/20240202")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        tollOpID: "AO",
        requestTimestamp: expect.any(String),
        periodFrom: "2024-02-01",
        periodTo: "2024-02-02",
        vOpList: expect.arrayContaining([
          expect.objectContaining({
            visitingOpID: expect.any(String),
            nPasses: expect.any(Number),
            passesCost: expect.any(Number),
          }),
        ]),
      });
    });

    it("should validate date format", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/chargesBy/AO/2024-0201/2024002")
        .set("X-OBSERVATORY-AUTH", token)
        .query({ format: "json" });

      expect(res.statusCode).toBe(400);
    });
  });
});
