@echo off
REM Quick Load Test - 10 seconds with 5 concurrent users

set TEST_DURATION=10
set CONCURRENT_USERS=5
set API_URL=http://localhost:4000

node load-tests\simple-load-test.js
