// __tests__/auth.test.js
const request = require("supertest");
const app = require("../src/app");
const {
  testPool,
  setupTestDb,
  cleanTestDb,
  generateTestToken,
} = require("./setup");
const bcrypt = require("bcrypt");

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    await cleanTestDb();
    // Insert test user
    const hashedPassword = await bcrypt.hash("testpass", 10);
    await testPool.query(
      "INSERT INTO Users (Username, Password, Role) VALUES ($1, $2, $3)",
      ["testuser", hashedPassword, "user"]
    );
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/login").send({
        username: "testuser",
        password: "testpass",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should fail with invalid credentials", async () => {
      const res = await request(app).post("/api/login").send({
        username: "testuser",
        password: "wrongpass",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });
  });

  describe("POST /register", () => {
    it("should allow admin to register new user", async () => {
      const token = generateTestToken({
        id: 1,
        role: "admin",
        username: "admin",
      });

      const res = await request(app)
        .post("/api/register")
        .set("X-OBSERVATORY-AUTH", token)
        .send({
          username: "newuser",
          password: "newpass",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
    });

    it("should not allow non-admin to register user", async () => {
      const token = generateTestToken({
        id: 2,
        role: "user",
        username: "user",
      });

      const res = await request(app)
        .post("/api/register")
        .set("X-OBSERVATORY-AUTH", token)
        .send({
          username: "newuser",
          password: "newpass",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty(
        "error",
        "Not Authorized, only for admin"
      );
    });
  });

  describe("GET /users", () => {
    it("should return list of users for admin", async () => {
      const token = generateTestToken({
        id: 1,
        role: "admin",
        username: "admin",
      });

      const res = await request(app)
        .get("/api/users")
        .set("X-OBSERVATORY-AUTH", token);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("Usernames");
      expect(res.text).toContain("testuser");
    });

    it("should deny access for non-admin users", async () => {
      const token = generateTestToken({
        id: 2,
        role: "user",
        username: "user",
      });

      const res = await request(app)
        .get("/api/users")
        .set("X-OBSERVATORY-AUTH", token);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty(
        "error",
        "Not Authorized, only for admin"
      );
    });
  });
});
