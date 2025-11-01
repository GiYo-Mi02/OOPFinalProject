/**
 * Get Real Auth Token via OTP Flow
 *
 * This script requests an OTP and helps you verify it to get a real token
 */

const readline = require("readline");
const http = require("http");

const BASE_URL = "http://localhost:4000";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🔐 Get Real Auth Token for Load Testing");
  console.log("=".repeat(60) + "\n");

  // Step 1: Request OTP
  const email = await new Promise((resolve) => {
    rl.question("Enter your @umak.edu.ph email: ", resolve);
  });

  if (!email.endsWith("@umak.edu.ph")) {
    console.error("\n❌ Error: Only @umak.edu.ph emails are allowed\n");
    rl.close();
    process.exit(1);
  }

  console.log("\n📧 Requesting OTP...");

  const otpResponse = await makeRequest("/api/auth/otp/request", "POST", {
    email,
  });

  if (otpResponse.status !== 200) {
    console.error(
      "\n❌ Error:",
      otpResponse.data.message || "Failed to request OTP"
    );
    rl.close();
    process.exit(1);
  }

  console.log("✅ OTP sent to your email!");
  console.log("   Check your inbox for the 6-digit code\n");

  // Step 2: Verify OTP
  const otp = await new Promise((resolve) => {
    rl.question("Enter the OTP code from your email: ", resolve);
  });

  console.log("\n🔍 Verifying OTP...");

  const verifyResponse = await makeRequest("/api/auth/otp/verify", "POST", {
    email,
    otp,
  });

  if (verifyResponse.status !== 200) {
    console.error("\n❌ Error:", verifyResponse.data.message || "Invalid OTP");
    rl.close();
    process.exit(1);
  }

  const token = verifyResponse.data.token;

  console.log("\n" + "=".repeat(60));
  console.log("✅ SUCCESS! Token Retrieved");
  console.log("=".repeat(60) + "\n");

  console.log("Your JWT Token:\n");
  console.log(token);
  console.log("\n");

  console.log("To use this token for load testing:\n");
  console.log("PowerShell:");
  console.log(`  $env:TEST_TOKEN="${token}"`);
  console.log("  .\\test-load-quick.bat\n");

  console.log("Or run directly:");
  console.log(`  $env:TEST_TOKEN="${token}"; .\\test-load-quick.bat\n`);

  console.log("=".repeat(60) + "\n");

  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  rl.close();
  process.exit(1);
});
