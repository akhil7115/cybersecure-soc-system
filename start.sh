#!/bin/bash

echo "Starting CyberSecure SOC System..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.7+ from https://python.org"
    exit 1
fi

# Install requirements if needed
echo "Installing dependencies..."
pip3 install -r requirements.txt

# Initialize database
echo "Setting up database..."
python3 database_setup.py

# Start the application
echo "Starting web server..."
python3 run.py