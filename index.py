from app import app, init_db
import threading
import time
import random
import sqlite3

def add_log(source, message, severity='info'):
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO logs (source, message, severity) VALUES (?, ?, ?)', 
                       (source, message, severity))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Database error: {e}")

def generate_normal_logs():
    normal_logs = [
        '✅ User login successful - jane.smith from office network',
        '🔒 Firewall blocked suspicious port scan from 203.45.67.89',
        '📁 File sync completed - documents folder (245 files)',
        '🌐 Outbound HTTPS connection allowed to microsoft.com',
        '🛡️ Antivirus scan completed - no threats found (15,432 files checked)',
        '💾 Backup process initiated - 2.3GB data secured',
        '🔐 VPN connection established - remote worker authenticated',
        '📊 System health check passed - all services running normally',
        '🔍 Network monitoring active - 1,247 connections tracked',
        '⚡ Security definitions updated - 45,231 new signatures added',
        '👤 User logout detected - session terminated safely',
        '🔄 Log rotation completed - archived 500MB of old logs'
    ]
    
    while True:
        time.sleep(random.randint(5, 15))
        log_msg = random.choice(normal_logs)
        add_log('SYSTEM', log_msg, 'info')

# Initialize database
init_db()

# Start background log generation
log_thread = threading.Thread(target=generate_normal_logs, daemon=True)
log_thread.start()

# This is required for Vercel
app = app