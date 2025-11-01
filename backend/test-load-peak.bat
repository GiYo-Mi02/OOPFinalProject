@echo off
REM Peak Load Test - 30 seconds with 50 concurrent users
REM Simulates lunch hour rush (300 votes in 2 hours)

set TEST_DURATION=30
set CONCURRENT_USERS=50
set API_URL=http://localhost:4000

echo.
echo ======================================================
echo  PEAK LOAD TEST - Lunch Hour Rush Simulation
echo  50 concurrent users for 30 seconds
echo ======================================================
echo.

node load-tests\simple-load-test.js
