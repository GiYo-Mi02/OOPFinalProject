@echo off
REM Get JWT Token Helper Script
REM This script helps you generate a valid JWT token for testing

echo.
echo ======================================================
echo  JWT Token Generator for Load Testing
echo ======================================================
echo.
echo This script will help you get a valid JWT token.
echo.
echo Option 1: Get token via API (Recommended)
echo ----------------------------------------
echo.
echo 1. Make sure your backend is running (npm run dev)
echo 2. Run the following commands:
echo.
echo    curl -X POST http://localhost:4000/api/auth/otp/request ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"email\":\"your-email@umak.edu.ph\"}"
echo.
echo 3. Check your email for the OTP code
echo.
echo 4. Verify the OTP:
echo.
echo    curl -X POST http://localhost:4000/api/auth/otp/verify ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"email\":\"your-email@umak.edu.ph\", \"otp\":\"123456\"}"
echo.
echo 5. Copy the "token" from the response
echo.
echo.
echo Option 2: Get token from Frontend (Easier)
echo ------------------------------------------
echo.
echo 1. Open http://localhost:5173 in your browser
echo 2. Sign in with your @umak.edu.ph email
echo 3. Press F12 to open DevTools
echo 4. Go to: Application ^> Local Storage ^> http://localhost:5173
echo 5. Find "umak-eballot:token" and copy its value
echo.
echo.
echo Then set it and run the test:
echo    set TEST_TOKEN=your-token-here
echo    .\test-load-authenticated.bat
echo.
pause
