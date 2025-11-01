@echo off
echo ========================================
echo PERFORMANCE COMPARISON TEST
echo ========================================
echo.
echo This will test the backend BEFORE and AFTER optimizations.
echo Make sure you have two terminal windows ready:
echo   1. Terminal for single-threaded server (npm run start)
echo   2. Terminal for clustered server (npm run start:cluster)
echo.
echo ========================================
echo PHASE 1: Testing Single-Threaded Server
echo ========================================
echo.
echo Instructions:
echo 1. In Terminal 1, run: npm run build ^&^& npm run start
echo 2. Wait for "Server running on port 5000"
echo 3. Press any key to continue...
pause > nul

echo.
echo Running test with 500 concurrent users...
echo.
set TEST_DURATION=60
set CONCURRENT_USERS=500
set TEST_URL=http://localhost:5000/api/votes/leaderboard/umak-main
node load-tests/simple-load-test.js > test-results-single-thread.txt

echo.
echo Results saved to: test-results-single-thread.txt
echo.
echo Now STOP the single-threaded server (Ctrl+C in Terminal 1)
echo Press any key when ready...
pause > nul

echo.
echo ========================================
echo PHASE 2: Testing Clustered Server
echo ========================================
echo.
echo Instructions:
echo 1. In Terminal 2, run: npm run start:cluster
echo 2. Wait for "Worker X started with PID Y" messages (4 workers)
echo 3. Press any key to continue...
pause > nul

echo.
echo Running test with 500 concurrent users...
echo.
set TEST_DURATION=60
set CONCURRENT_USERS=500
set TEST_URL=http://localhost:5000/api/votes/leaderboard/umak-main
node load-tests/simple-load-test.js > test-results-clustered.txt

echo.
echo Results saved to: test-results-clustered.txt
echo.
echo ========================================
echo COMPARISON COMPLETE
echo ========================================
echo.
echo View results:
echo   - Single-threaded: test-results-single-thread.txt
echo   - Clustered: test-results-clustered.txt
echo.
echo Key metrics to compare:
echo   - Success Rate (should improve from 87%% to ^>95%%)
echo   - Throughput (requests/sec)
echo   - Latency (p50, p95, p99)
echo   - Timeouts (should decrease significantly)
echo.
pause
