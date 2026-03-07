const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Set JWT_SECRET for tests
process.env.JWT_SECRET = "test-secret-key";

/**
 * UNIT TEST 1: Password hashing — verifies bcrypt hashes and compares correctly
 */
describe("Password Hashing", () => {
    test("hashed password should not match plain text", async () => {
        const password = "Admin@123";
        const hashed = await bcrypt.hash(password, 10);
        expect(hashed).not.toBe(password);
    });

    test("bcrypt.compare should return true for correct password", async () => {
        const password = "Admin@123";
        const hashed = await bcrypt.hash(password, 10);
        const isMatch = await bcrypt.compare(password, hashed);
        expect(isMatch).toBe(true);
    });

    test("bcrypt.compare should return false for wrong password", async () => {
        const password = "Admin@123";
        const hashed = await bcrypt.hash(password, 10);
        const isMatch = await bcrypt.compare("WrongPassword", hashed);
        expect(isMatch).toBe(false);
    });
});

/**
 * UNIT TEST 2: JWT token generation and verification
 */
describe("JWT Token", () => {
    test("should generate a valid token and decode it", () => {
        const userId = 42;
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(userId);
    });

    test("should reject a token with wrong secret", () => {
        const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "7d" });
        expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });
});

/**
 * UNIT TEST 3: Role middleware — blocks non-admin users
 */
describe("Role Middleware", () => {
    const adminOnly = require("../src/middlewares/role.middleware");

    test("should call next() for admin user", () => {
        const req = { user: { role: "ADMIN" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        adminOnly(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 for non-admin user", () => {
        const req = { user: { role: "CUSTOMER" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        adminOnly(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Access denied: Admin only" });
    });
});
