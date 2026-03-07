const request = require("supertest");
const app = require("../src/app");

// Use a unique email per test run to avoid conflicts
const testEmail = `testuser_${Date.now()}@test.com`;
let authToken = "";

/**
 * API TEST 1: POST /api/auth/register — creates a new user
 */
describe("POST /api/auth/register", () => {
    test("should register a new user and return token", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "Test User", email: testEmail, password: "Test@123" });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");
        expect(res.body.user.email).toBe(testEmail);
        expect(res.body.user).not.toHaveProperty("password");
    });

    test("should reject duplicate email registration", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "Test User", email: testEmail, password: "Test@123" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Email already exists");
    });

    test("should reject registration without required fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "incomplete@test.com" });

        expect(res.status).toBe(400);
    });
});

/**
 * API TEST 2: POST /api/auth/login — authenticates a user
 */
describe("POST /api/auth/login", () => {
    test("should login with valid credentials and return token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: testEmail, password: "Test@123" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe(testEmail);
        authToken = res.body.token;
    });

    test("should reject login with wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: testEmail, password: "WrongPassword" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid email or password");
    });

    test("should reject login with non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "noone@nowhere.com", password: "anything" });

        expect(res.status).toBe(400);
    });
});
