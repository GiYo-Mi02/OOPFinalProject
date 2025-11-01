@echo off
REM Extreme Concurrency Test - 500 users
REM Tests absolute maximum capacity

echo.
echo ======================================================
echo  EXTREME LOAD TEST - 1000 CONCURRENT USERS
echo  WARNING: This is an extreme stress test!
echo ======================================================
echo.

set TEST_DURATION=60
set CONCURRENT_USERS=1000
set API_URL=http://localhost:4000

echo Configuration:
echo   Duration:    60 seconds
echo   Concurrency: 1000 users (extreme stress test)
echo   Purpose:     Find the breaking point
echo.
echo This test simulates an unrealistic but useful scenario
echo to understand your system's absolute limits.
echo.

node load-tests\simple-load-test.js
