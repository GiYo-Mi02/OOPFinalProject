@echo off
echo ========================================
echo Starting Clustered Server on Port 5000
echo ========================================
echo.
echo This uses port 5000 to avoid TIME_WAIT connections on port 4000
echo.

set PORT=5000
node dist/src/server-cluster.js
