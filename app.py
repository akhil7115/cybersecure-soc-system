from flask import Flask, render_template, request, jsonify
import sqlite3
import datetime
import json
import random
import threading
import time

app = Flask(__name__)

# Initialize database
def init_db():
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
    
    conn.commit()
    conn.close()

# Database helper functions
def add_log(source, message, severity='info'):
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO logs (source, message, severity) VALUES (?, ?, ?)', 
                       (source, message, severity))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Database error in add_log: {e}")

def add_alert(threat_type, severity, description):
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO alerts (threat_type, severity, description) VALUES (?, ?, ?)', 
                       (threat_type, severity, description))
        alert_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return alert_id
    except sqlite3.Error as e:
        print(f"Database error in add_alert: {e}")
        return None

def get_recent_logs(limit=50):
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?', (limit,))
        logs = cursor.fetchall()
        conn.close()
        return logs
    except sqlite3.Error as e:
        print(f"Database error in get_recent_logs: {e}")
        return []

def get_active_alerts():
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM alerts WHERE status = "active" ORDER BY timestamp DESC')
        alerts = cursor.fetchall()
        conn.close()
        return alerts
    except sqlite3.Error as e:
        print(f"Database error in get_active_alerts: {e}")
        return []

# Threat detection scenarios
threat_scenarios = {
    'brute-force': {
        'name': 'Brute Force Attack',
        'severity': 'high',
        'logs': [
            'Failed login attempt from 192.168.1.100 - user: admin',
            'Failed login attempt from 192.168.1.100 - user: root',
            'Failed login attempt from 192.168.1.100 - user: administrator',
            'AI/ML: Brute force pattern detected - 15 attempts in 2 minutes'
        ],
        'description': 'Multiple failed login attempts detected from IP 192.168.1.100'
    },
    'insider-threat': {
        'name': 'Insider Privilege Misuse',
        'severity': 'medium',
        'logs': [
            'User john.doe accessed /confidential/payroll.xlsx at 02:30 AM',
            'Unusual file access pattern detected for user john.doe',
            'AI/ML: Insider threat behavior pattern identified'
        ],
        'description': 'Employee accessing sensitive files outside normal hours'
    },
    'data-exfiltration': {
        'name': 'Data Exfiltration Attempt',
        'severity': 'high',
        'logs': [
            'Large file upload detected - 2.5GB to external.server.com',
            'USB device connected - copying sensitive files',
            'AI/ML: Data exfiltration pattern detected - anomalous data volume'
        ],
        'description': 'Large data transfer to external server detected'
    },
    'malware': {
        'name': 'Malware Indicators',
        'severity': 'high',
        'logs': [
            'Suspicious process detected - crypto_miner.exe',
            'Outbound connection to known malicious IP 45.33.32.156',
            'AI/ML: Malware signature match - 95% confidence'
        ],
        'description': 'Suspicious process behavior and network connections'
    }
}

# Routes
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/stats')
def get_stats():
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM alerts WHERE status = "active"')
        active_threats = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM logs')
        logs_processed = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM alerts')
        alerts_generated = cursor.fetchone()[0]
        
        # Get today's logs count
        cursor.execute('SELECT COUNT(*) FROM logs WHERE date(timestamp) = date("now")')
        today_logs = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'active_threats': active_threats,
            'logs_processed': logs_processed,
            'alerts_generated': alerts_generated,
            'today_logs': today_logs,
            'system_status': 'Online',
            'last_update': datetime.datetime.now().isoformat()
        })
    except sqlite3.Error as e:
        print(f"Database error in get_stats: {e}")
        return jsonify({
            'active_threats': 0,
            'logs_processed': 0,
            'alerts_generated': 0,
            'today_logs': 0,
            'system_status': 'Error',
            'last_update': datetime.datetime.now().isoformat()
        })

@app.route('/api/logs')
def get_logs():
    logs = get_recent_logs(30)
    result = []
    for log in logs:
        try:
            result.append({
                'id': log[0],
                'timestamp': log[1],
                'source': log[2],
                'message': log[3],
                'severity': log[4]
            })
        except (IndexError, TypeError) as e:
            print(f"Error processing log: {e}")
            continue
    return jsonify(result)

@app.route('/api/alerts')
def get_alerts():
    alerts = get_active_alerts()
    return jsonify([{
        'id': alert[0],
        'timestamp': alert[1],
        'threat_type': alert[2],
        'severity': alert[3],
        'description': alert[4],
        'status': alert[5]
    } for alert in alerts])

@app.route('/api/chart_data')
def get_chart_data():
    try:
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        
        # Get threat distribution data
        cursor.execute('''
            SELECT threat_type, COUNT(*) as count 
            FROM alerts 
            WHERE timestamp >= datetime('now', '-24 hours') 
            GROUP BY threat_type
        ''')
        threat_distribution = dict(cursor.fetchall())
        
        # Get hourly threat timeline
        cursor.execute('''
            SELECT strftime('%H:00', timestamp) as hour, COUNT(*) as count
            FROM alerts 
            WHERE timestamp >= datetime('now', '-24 hours')
            GROUP BY hour
            ORDER BY hour
        ''')
        threat_timeline = dict(cursor.fetchall())
        
        # Get geographic data (simulated)
        geographic_data = {
            'USA': random.randint(40, 50),
            'China': random.randint(35, 45),
            'Russia': random.randint(30, 40),
            'Brazil': random.randint(25, 35),
            'India': random.randint(20, 30),
            'Germany': random.randint(15, 25)
        }
        
        # System performance metrics (simulated)
        performance_data = {
            'CPU': random.randint(70, 95),
            'Memory': random.randint(60, 85),
            'Network': random.randint(80, 98),
            'Disk': random.randint(55, 80),
            'Security': random.randint(90, 99),
            'Uptime': random.randint(95, 100)
        }
        
        # Network traffic data (simulated)
        network_data = {
            'inbound': round(random.uniform(20, 70), 1),
            'outbound': round(random.uniform(10, 40), 1),
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        # Security score (simulated)
        security_score = random.randint(88, 97)
        
        conn.close()
        
        return jsonify({
            'threat_distribution': threat_distribution,
            'threat_timeline': threat_timeline,
            'geographic_data': geographic_data,
            'performance_data': performance_data,
            'network_data': network_data,
            'security_score': security_score,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except sqlite3.Error as e:
        print(f"Database error in get_chart_data: {e}")
        return jsonify({
            'error': 'Database error',
            'threat_distribution': {},
            'threat_timeline': {},
            'geographic_data': {},
            'performance_data': {},
            'network_data': {'inbound': 0, 'outbound': 0},
            'security_score': 0
        }), 500

@app.route('/api/simulate/<threat_type>')
def simulate_threat(threat_type):
    if threat_type not in threat_scenarios:
        return jsonify({'error': 'Invalid threat type'}), 400
    
    scenario = threat_scenarios[threat_type]
    
    # Add logs to database
    for log_msg in scenario['logs']:
        add_log('FIREWALL' if 'login' in log_msg else 'ENDPOINT', log_msg, 'warning')
    
    # Create alert
    alert_id = add_alert(scenario['name'], scenario['severity'], scenario['description'])
    
    return jsonify({'success': True, 'alert_id': alert_id})

@app.route('/api/execute_action', methods=['POST'])
def execute_action():
    try:
        data = request.json or {}
        action = data.get('action', 'Unknown Action')
        alert_id = data.get('alert_id', 0)
        
        # Simulate realistic action execution with detailed logging
        action_logs = {
            'Block Hacker\'s IP Address': 'IP address blocked on firewall - threat neutralized',
            'Lock Compromised Account': 'User account locked and password reset required',
            'Alert Security Team': 'Security team notified via email and SMS alerts',
            'Disable Employee Account': 'Employee account disabled pending investigation',
            'Notify HR Department': 'HR department notified of potential insider threat',
            'Review File Access History': 'File access audit initiated for suspicious activity',
            'Block Data Transfer': 'External data transfer blocked - files quarantined',
            'Secure Sensitive Files': 'Sensitive files moved to secure vault with encryption',
            'Investigate User Activity': 'User activity investigation started - forensics team alerted',
            'Isolate Infected Computer': 'Computer isolated from network - malware contained',
            'Run Virus Scan': 'Full system antivirus scan initiated - estimated 15 minutes',
            'Update Security Definitions': 'Security definitions updated - 1,247 new threat signatures added'
        }
        
        # Log the action with detailed message
        detailed_message = action_logs.get(action, f'Security action executed: {action}')
        add_log('AUTOMATED_RESPONSE', detailed_message, 'info')
        
        # Record response in database
        conn = sqlite3.connect('soc_database.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO responses (alert_id, action) VALUES (?, ?)', (alert_id, action))
        
        # Mark alert as resolved if it's a blocking action
        if any(keyword in action.lower() for keyword in ['block', 'disable', 'isolate', 'lock']):
            cursor.execute('UPDATE alerts SET status = "resolved" WHERE id = ?', (alert_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': f'{action} executed successfully',
            'detailed_message': detailed_message
        })
    except Exception as e:
        print(f"Error in execute_action: {e}")
        return jsonify({
            'success': False,
            'message': 'Action execution failed',
            'error': str(e)
        }), 500

# Background task to generate realistic real-time logs
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
        time.sleep(random.randint(3, 8))  # Generate logs every 3-8 seconds for realism
        log_msg = random.choice(normal_logs)
        add_log('SYSTEM', log_msg, 'info')

@app.route('/chart/<chart_type>')
def chart_details(chart_type):
    """Route for detailed chart analysis page"""
    return render_template('chart_details.html', chart_type=chart_type)

if __name__ == '__main__':
    init_db()
    
    # Start background log generation
    log_thread = threading.Thread(target=generate_normal_logs, daemon=True)
    log_thread.start()
    
    app.run(debug=True)