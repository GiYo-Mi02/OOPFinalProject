# Load Testing Guide - UMak eBallot

## Overview

Load testing tools to simulate and measure backend performance under various load scenarios, particularly for handling **1000 votes per day**.

## Quick Start

### 1. Simple Load Test (No Dependencies)

Test your backend with zero additional packages:

```bash
# From backend directory
node load-tests/simple-load-test.js
```

**Customize the test:**

```bash
# Test for 2 minutes with 50 concurrent users
TEST_DURATION=120 CONCURRENT_USERS=50 node load-tests/simple-load-test.js

# Test against production
API_URL=https://your-api.com node load-tests/simple-load-test.js

# With authentication (for vote submission tests)
TEST_TOKEN=your-jwt-token node load-tests/simple-load-test.js
```

### 2. Advanced Load Test (Using autocannon)

For more detailed metrics:

```bash
# Install autocannon globally
npm install -g autocannon

# Or install as dev dependency
npm install --save-dev autocannon

# Run advanced tests
npm run test:load
```

## Understanding the Load: 1000 Votes/Day

### Typical Distribution

```
Time Range    | Votes | Percentage | Rate (req/s)
--------------|-------|------------|-------------
08:00-10:00   |   50  |     5%     |   0.007
10:00-12:00   |  150  |    15%     |   0.021
12:00-14:00   |  300  |    30%     |   0.042  ← PEAK
14:00-16:00   |  250  |    25%     |   0.035
16:00-18:00   |  200  |    20%     |   0.028
18:00-20:00   |   50  |     5%     |   0.007
```

### Key Insights

- **Peak Load**: 300 votes during lunch (12:00-14:00)
- **Peak Rate**: ~0.042 requests/second (very low!)
- **Concurrent Users**: ~12 students voting simultaneously (assuming 5min to vote)
- **Backend Capacity Needed**: At minimum 1 req/s to have comfortable margin

## Test Scenarios

### Scenario 1: Normal Load

Simulates average traffic throughout the day

```bash
TEST_DURATION=60 CONCURRENT_USERS=10 node load-tests/simple-load-test.js
```

### Scenario 2: Peak Hour (Lunch Rush)

Simulates 30% of daily votes in 2 hours

```bash
TEST_DURATION=30 CONCURRENT_USERS=50 node load-tests/simple-load-test.js
```

### Scenario 3: Leaderboard Stress

100 students watching live results (5-second auto-refresh)

```bash
TEST_DURATION=60 CONCURRENT_USERS=100 node load-tests/simple-load-test.js
```

### Scenario 4: Cache Performance

Test Redis caching effectiveness with high concurrent reads

```bash
TEST_DURATION=30 CONCURRENT_USERS=200 node load-tests/simple-load-test.js
```

## Interpreting Results

### Success Criteria

| Metric           | Target    | Description                          |
| ---------------- | --------- | ------------------------------------ |
| **Success Rate** | ≥ 99.9%   | Requests completed without errors    |
| **Avg Latency**  | < 200ms   | Average response time                |
| **p95 Latency**  | < 500ms   | 95% of requests complete under 500ms |
| **Throughput**   | ≥ 1 req/s | Sustained request rate               |

### Example Good Result

```
📊 LOAD TEST RESULTS
═══════════════════════════════════════════════════════════

🎯 Requests:
   Total:        1,247
   Successful:   1,247 (100.00%)
   Failed:       0
   Timeouts:     0
   Rate:         20.78 req/s

⚡ Latency (ms):
   Average:      45.23
   Median (p50): 42
   p95:          89
   p99:          125
   Min:          18
   Max:          203

✅ Backend can handle 1000 votes/day (149.0x capacity)
✅ p95 latency under 500ms - good user experience
✅ 100.00% success rate - very reliable
```

### Red Flags 🚩

1. **High Error Rate** (>5%)

   - Check database connection pool
   - Verify Redis is running
   - Check Supabase rate limits

2. **High Latency** (p95 > 1000ms)

   - Database queries need optimization
   - Add indexes on frequently queried columns
   - Check if Redis caching is working

3. **Low Throughput** (< 1 req/s)
   - Bottleneck in code (blocking operations)
   - Database connection issues
   - Network problems

## Performance Optimization Checklist

### Database (Supabase)

- [ ] Add index on `votes.election_id`
- [ ] Add index on `votes.user_id`
- [ ] Add composite index on `(election_id, position_id)`
- [ ] Enable connection pooling
- [ ] Review slow query logs

### Redis Cache

- [ ] Verify Redis is running (`redis-cli ping`)
- [ ] Check cache hit rate in logs
- [ ] Set appropriate TTL (e.g., 30 seconds for leaderboard)
- [ ] Monitor Redis memory usage
- [ ] Consider Redis clustering for high load

### Application Code

- [ ] Use async/await properly (no blocking operations)
- [ ] Implement request rate limiting per user
- [ ] Add request timeout handling
- [ ] Enable gzip compression
- [ ] Use connection pooling for external services

### Infrastructure

- [ ] Use CDN for static assets
- [ ] Enable HTTP/2
- [ ] Configure proper CORS headers
- [ ] Set up load balancing (for very high load)
- [ ] Monitor server CPU/memory usage

## Monitoring in Production

### Key Metrics to Track

1. **Response Time**

   - Average, p95, p99 latency
   - Track by endpoint

2. **Error Rate**

   - HTTP 5xx errors
   - Database errors
   - Timeout errors

3. **Throughput**

   - Requests per second
   - Peak vs. average

4. **Resource Usage**
   - CPU utilization
   - Memory consumption
   - Database connections
   - Redis memory

### Tools

- **Application Performance Monitoring (APM)**

  - New Relic
  - DataDog
  - Sentry

- **Server Monitoring**

  - PM2 (if using Node.js in production)
  - Grafana + Prometheus
  - Cloud provider dashboards (AWS CloudWatch, Azure Monitor)

- **Real User Monitoring (RUM)**
  - Google Analytics
  - Mixpanel
  - Custom event tracking

## Scaling Guidelines

### Current Setup (1,000 votes/day)

✅ Single server with Redis cache - **MORE THAN SUFFICIENT**

Expected capacity: 10,000-100,000+ requests/day

### If Scaling to 10,000 votes/day

✅ Still single server - no changes needed

- Add monitoring
- Optimize database indexes

### If Scaling to 100,000 votes/day

- Consider database read replicas
- Add CDN for static content
- Implement advanced caching strategies
- Rate limiting per user

### If Scaling to 1,000,000+ votes/day

- Load balancer with multiple app servers
- Redis cluster
- Database sharding
- Separate read/write databases
- Queue system for write operations

## Troubleshooting

### Problem: High latency during tests

**Solutions:**

1. Check if Redis is running: `redis-cli ping`
2. Verify database indexes exist
3. Check Supabase dashboard for slow queries
4. Monitor server CPU/memory during test

### Problem: Connection timeouts

**Solutions:**

1. Increase connection pool size
2. Check network connectivity
3. Verify firewall rules
4. Increase timeout values

### Problem: Cache not working

**Solutions:**

1. Check Redis connection in logs
2. Verify REDIS_URL in .env
3. Check cache key generation
4. Monitor Redis with `redis-cli monitor`

## Running Tests in CI/CD

Add to GitHub Actions or other CI:

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Weekly

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run load test
        run: |
          TEST_DURATION=30 \
          CONCURRENT_USERS=20 \
          API_URL=${{ secrets.API_URL }} \
          node load-tests/simple-load-test.js
        working-directory: ./backend

      - name: Check results
        run: echo "Load test completed"
```

## Resources

- [Autocannon Documentation](https://github.com/mcollina/autocannon)
- [k6 Load Testing](https://k6.io/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

## Support

For questions or issues with load testing:

1. Check logs in `backend/logs/` directory
2. Review Supabase dashboard for database performance
3. Monitor Redis with `redis-cli info stats`

---

**Remember**: For 1000 votes/day, you have MASSIVE headroom. The real bottleneck will likely be user experience (network speed, device performance) rather than backend capacity.
