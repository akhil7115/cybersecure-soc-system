import sqlite3
import datetime

def setup_database():
    """Initialize the SOC database with sample data"""
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                source TEXT,
                message TEXT,
                severity TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                threat_type TEXT,
                severity TEXT,
                description TEXT,
                status TEXT DEFAULT 'active'
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id INTEGER,
                action TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (alert_id) REFERENCES alerts (id)
            )
        ''')
        
        # Insert sample logs only if table is empty
        cursor.execute('SELECT COUNT(*) FROM logs')
        if cursor.fetchone()[0] == 0:
            sample_logs = [
                ('SYSTEM', 'SOC System initialized successfully', 'info'),
                ('FIREWALL', 'Normal traffic from 192.168.1.50', 'info'),
                ('ENDPOINT', 'User login successful - jane.smith', 'info'),
                ('SYSTEM', 'Antivirus definitions updated', 'info'),
                ('FIREWALL', 'VPN connection established', 'info')
            ]
            cursor.executemany('INSERT INTO logs (source, message, severity) VALUES (?, ?, ?)', sample_logs)
        
        conn.commit()
        conn.close()
        print("Database setup completed successfully!")
    except sqlite3.Error as e:
        print(f"Database setup error: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error during database setup: {e}")
        raise

if __name__ == '__main__':
    setup_database()