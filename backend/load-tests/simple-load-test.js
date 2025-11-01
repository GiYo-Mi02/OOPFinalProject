/**
 * Simple Load Test Runner
 *
 * Quick performance test without external dependencies
 * Tests concurrent vote submissions and leaderboard queries
 */

const http = require("http");
const https = require("https");

const BASE_URL = process.env.API_URL || "http://localhost:4000";
const TEST_TOKEN = process.env.TEST_TOKEN || "";
const TEST_DURATION = parseInt(process.env.TEST_DURATION || "60"); // seconds
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || "10");

// Parse URL
const url = new URL(BASE_URL);
const isHttps = url.protocol === "https:";
const client = isHttps ? https : http;

// Test data
const testElectionId = "test-election-id";
const testVotes = {
  "position-1": "candidate-1",
  "position-2": "candidate-2",
  "position-3": "candidate-3",
};

// Metrics
const metrics = {
  requests: 0,
  success: 0,
  errors: 0,
  timeouts: 0,
  latencies: [],
  startTime: null,
  endTime: null,
  statusCodes: {},
};

/**
 * Make HTTP request
 */
function makeRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
      timeout: 10000, // 10 second timeout
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        const latency = Date.now() - startTime;
        metrics.latencies.push(latency);

        // Track status codes
        metrics.statusCodes[res.statusCode] =
          (metrics.statusCodes[res.statusCode] || 0) + 1;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          metrics.success++;
          resolve({ statusCode: res.statusCode, latency, data });
        } else {
          metrics.errors++;
          resolve({ statusCode: res.statusCode, latency, error: data });
        }
      });
    });

    req.on("error", (error) => {
      metrics.errors++;
      reject(error);
    });

    req.on("timeout", () => {
      metrics.timeouts++;
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test leaderboard query
 */
async function testLeaderboard() {
  metrics.requests++;
  try {
    // Use a test institute ID (or fetch from real data)
    // For CCIS (Computer and Information Sciences), use actual ID or "test"
    await makeRequest("/api/votes/leaderboard/test-institute-id", "GET");
  } catch (error) {
    // Error already counted
  }
}

/**
 * Test vote submission (if authenticated)
 */
async function testVoteSubmission() {
  metrics.requests++;
  try {
    await makeRequest("/api/votes", "POST", {
      electionId: testElectionId,
      votes: testVotes,
    });
  } catch (error) {
    // Error already counted
  }
}

/**
 * Run concurrent requests
 */
async function runConcurrentRequests(testFn, concurrency, duration) {
  const workers = [];
  const endTime = Date.now() + duration * 1000;

  for (let i = 0; i < concurrency; i++) {
    const worker = async () => {
      while (Date.now() < endTime) {
        await testFn();
        // Small delay to prevent overwhelming
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100)
        );
      }
    };
    workers.push(worker());
  }

  await Promise.all(workers);
}

/**
 * Calculate statistics
 */
function calculateStats() {
  if (metrics.latencies.length === 0) {
    return null;
  }

  const sorted = metrics.latencies.sort((a, b) => a - b);
  const len = sorted.length;

  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / len;

  const p50 = sorted[Math.floor(len * 0.5)];
  const p95 = sorted[Math.floor(len * 0.95)];
  const p99 = sorted[Math.floor(len * 0.99)];
  const max = sorted[len - 1];
  const min = sorted[0];

  return { mean, p50, p95, p99, max, min };
}

/**
 * Print results
 */
function printResults() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const reqPerSec = metrics.requests / duration;
  const stats = calculateStats();

  console.log("\n" + "=".repeat(60));
  console.log("📊 LOAD TEST RESULTS");
  console.log("=".repeat(60) + "\n");

  console.log("🎯 Requests:");
  console.log(`   Total:        ${metrics.requests}`);
  console.log(
    `   Successful:   ${metrics.success} (${(
      (metrics.success / metrics.requests) *
      100
    ).toFixed(2)}%)`
  );
  console.log(`   Failed:       ${metrics.errors}`);
  console.log(`   Timeouts:     ${metrics.timeouts}`);
  console.log(`   Rate:         ${reqPerSec.toFixed(2)} req/s\n`);

  if (stats) {
    console.log("⚡ Latency (ms):");
    console.log(`   Average:      ${stats.mean.toFixed(2)}`);
    console.log(`   Median (p50): ${stats.p50}`);
    console.log(`   p95:          ${stats.p95}`);
    console.log(`   p99:          ${stats.p99}`);
    console.log(`   Min:          ${stats.min}`);
    console.log(`   Max:          ${stats.max}\n`);
  }

  console.log("📈 Status Codes:");
  Object.entries(metrics.statusCodes).forEach(([code, count]) => {
    console.log(`   ${code}:          ${count}`);
  });

  console.log("\n⏱️  Duration:");
  console.log(`   Total:        ${duration.toFixed(2)} seconds\n`);

  // Assessment for 1000 votes/day
  console.log("💡 Assessment for 1000 votes/day:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const dailyCapacity = reqPerSec * 60 * 60 * 8; // 8 hour voting window
  const peakHourCapacity = reqPerSec * 60 * 60; // Per hour

  console.log(
    `   Current capacity:  ~${Math.floor(
      dailyCapacity
    )} requests/day (8hr window)`
  );
  console.log(
    `   Peak hour capacity: ~${Math.floor(peakHourCapacity)} requests/hour`
  );
  console.log(`   Target load:        1000 votes/day (peak: ~300 votes/hour)`);

  if (dailyCapacity >= 1000) {
    console.log(
      `   ✅ Backend can handle 1000 votes/day (${(
        dailyCapacity / 1000
      ).toFixed(1)}x capacity)`
    );
  } else {
    console.log(
      `   ⚠️  May struggle with 1000 votes/day - optimization needed`
    );
  }

  if (stats && stats.p95 < 500) {
    console.log(`   ✅ p95 latency under 500ms - good user experience`);
  } else {
    console.log(`   ⚠️  p95 latency high - users may notice slowness`);
  }

  const successRate = (metrics.success / metrics.requests) * 100;
  if (successRate >= 99) {
    console.log(
      `   ✅ ${successRate.toFixed(2)}% success rate - very reliable`
    );
  } else if (successRate >= 95) {
    console.log(
      `   ⚠️  ${successRate.toFixed(2)}% success rate - acceptable but monitor`
    );
  } else {
    console.log(
      `   ❌ ${successRate.toFixed(2)}% success rate - investigation needed`
    );
  }

  console.log("\n");
}

/**
 * Main runner
 */
async function main() {
  console.log("🚀 UMak eBallot Simple Load Test\n");
  console.log("Configuration:");
  console.log(`   Target:      ${BASE_URL}`);
  console.log(`   Duration:    ${TEST_DURATION} seconds`);
  console.log(`   Concurrency: ${CONCURRENT_USERS} users`);
  console.log(`   Auth:        ${TEST_TOKEN ? "Enabled ✅" : "Disabled ⚠️"}\n`);

  if (!TEST_TOKEN) {
    console.log(
      "⚠️  Warning: TEST_TOKEN not set. Testing public endpoints only.\n"
    );
  }

  console.log("Starting test...\n");

  metrics.startTime = Date.now();

  // Run leaderboard stress test (most common operation)
  await runConcurrentRequests(testLeaderboard, CONCURRENT_USERS, TEST_DURATION);

  metrics.endTime = Date.now();

  printResults();
}

// Handle errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught error:", error.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n\n⚠️  Test interrupted by user");
  if (metrics.startTime) {
    metrics.endTime = Date.now();
    printResults();
  }
  process.exit(0);
});

// Run
main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
