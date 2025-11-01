@echo off
REM Stress Test - 60 seconds with 200 concurrent users
REM Tests extreme load beyond normal operation

set TEST_DURATION=60
set CONCURRENT_USERS=200
set API_URL=http://localhost:4000

echo.
echo ======================================================
echo  STRESS TEST - Extreme Load Simulation
echo  200 concurrent users for 60 seconds
echo  WARNING: This may impact server performance
echo ======================================================
echo.

node load-tests\simple-load-test.js
