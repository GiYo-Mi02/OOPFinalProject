@echo off
REM Authenticated Load Test
REM This test requires a valid JWT token from your application

echo.
echo ======================================================
echo  Authenticated Load Test Setup
echo ======================================================
echo.
echo To run an authenticated load test, you need a valid JWT token.
echo.
echo How to get a token:
echo   1. Open your frontend at http://localhost:5173
echo   2. Sign in with your @umak.edu.ph email
echo   3. Open Browser DevTools (F12) ^> Application ^> Local Storage
echo   4. Find 'umak-eballot:token' and copy the value
echo   5. Set it as an environment variable:
echo.
echo      set TEST_TOKEN=your-jwt-token-here
echo      .\test-load-quick.bat
echo.
echo Or run this test directly with:
echo   set TEST_TOKEN=your-token-here ^&^& .\test-load-authenticated.bat
echo.

if "%TEST_TOKEN%"=="" (
    echo ❌ TEST_TOKEN is not set!
    echo.
    echo Please set TEST_TOKEN environment variable and try again:
    echo    set TEST_TOKEN=your-jwt-token-here
    echo    .\test-load-authenticated.bat
    echo.
    exit /b 1
)

echo ✅ TEST_TOKEN is set
echo.
echo Running authenticated load test...
echo.

set TEST_DURATION=30
set CONCURRENT_USERS=10
set API_URL=http://localhost:4000

node load-tests\simple-load-test.js
