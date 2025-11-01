/**
 * Generate Test JWT Token
 *
 * This script generates a valid JWT token for load testing
 * without needing to go through the full OTP flow
 */

const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
require("dotenv").config();

const APP_JWT_SECRET = process.env.APP_JWT_SECRET;

if (!APP_JWT_SECRET) {
  console.error("❌ Error: APP_JWT_SECRET not found in .env file");
  process.exit(1);
}

// Generate a test user token
const testUser = {
  sub: randomUUID(), // User ID
  email: "test-user@umak.edu.ph",
  role: "student",
  instituteId: null,
};

const token = jwt.sign(testUser, APP_JWT_SECRET, {
  expiresIn: "12h",
  issuer: "umak-eballot",
});

console.log("\n" + "=".repeat(60));
console.log("✅ Test JWT Token Generated Successfully");
console.log("=".repeat(60) + "\n");

console.log("Token Details:");
console.log("  User ID:    ", testUser.sub);
console.log("  Email:      ", testUser.email);
console.log("  Role:       ", testUser.role);
console.log("  Expires:     12 hours");
console.log("\nYour JWT Token:\n");
console.log(token);
console.log("\n");

console.log("To use this token for load testing:\n");
console.log("  Windows (CMD/PowerShell):");
console.log("    set TEST_TOKEN=" + token);
console.log("    .\\test-load-authenticated.bat\n");

console.log("  Or run directly:");
console.log("    set TEST_TOKEN=" + token + " && .\\test-load-quick.bat\n");

console.log(
  "Copy the token above and set it as TEST_TOKEN environment variable."
);
console.log("=".repeat(60) + "\n");
