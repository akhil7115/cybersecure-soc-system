@echo off
echo Starting CyberSecure SOC System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

REM Install requirements if needed
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo Setting up database...
python database_setup.py

REM Start the application
echo Starting web server...
python run.py

pause