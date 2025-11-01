@echo off
REM High Concurrency Vote Load Test
REM Simulates many students voting simultaneously

echo.
echo ======================================================
echo  HIGH CONCURRENCY VOTE LOAD TEST
echo  Simulating 100 concurrent voters
echo ======================================================
echo.

set TEST_DURATION=30
set CONCURRENT_USERS=500
set API_URL=http://localhost:4000

echo Configuration:
echo   Duration:    30 seconds
echo   Concurrency: 500 users (realistic peak scenario)
echo   Scenario:    Lunch hour rush - many students voting at once
echo.

node load-tests\simple-load-test.js
