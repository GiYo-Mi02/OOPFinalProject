@echo off
REM Full Load Test - 60 seconds with 10 concurrent users

set TEST_DURATION=60
set CONCURRENT_USERS=10
set API_URL=http://localhost:4000

echo.
echo ======================================================
echo  UMak eBallot Load Test
echo  Testing 1000 votes/day scenario
echo ======================================================
echo.

node load-tests\simple-load-test.js
