# CyberSecure SOC - AI/ML Threat Detection System

## 🛡️ Full-Stack Cybersecurity SOC System

A comprehensive web-based Security Operations Center (SOC) system built with **Python Flask**, **SQLite Database**, **HTML/CSS/JavaScript** that automates threat detection and incident response using AI/ML techniques.

## 🚀 Technologies Used

- **Backend**: Python Flask
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with animations and responsive design
- **API**: RESTful Flask APIs for real-time data

## 📁 Project Structure

```
cyber_secure/
├── app.py                  # Main Flask application
├── run.py                  # Application runner script
├── database_setup.py       # Database initialization
├── requirements.txt        # Python dependencies
├── soc_database.db        # SQLite database (auto-created)
├── templates/
│   └── dashboard.html     # Main dashboard template
├── static/
│   ├── style.css          # CSS styling
│   └── script.js          # Frontend JavaScript
└── README.md              # Documentation
```

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
python database_setup.py
```

### 3. Run Application
```bash
python run.py
```

### 4. Access Dashboard
Open your browser and go to: `http://localhost:5000`

## 🎯 Core Features

### Real-time Dashboard
- **Live Statistics**: Active threats, logs processed, alerts generated
- **System Status**: Real-time monitoring of SOC system health
- **Auto-refresh**: Updates every 3-5 seconds

### AI/ML Threat Detection Engine
1. **Brute Force Detection** - Multiple failed login attempts
2. **Insider Privilege Misuse** - Unusual employee access patterns
3. **Data Exfiltration** - Large data transfers to external servers
4. **Malware Indicators** - Suspicious processes and network connections

### Database-Driven Architecture
- **Logs Table**: Stores all system, firewall, and endpoint logs
- **Alerts Table**: Manages security alerts with severity levels
- **Responses Table**: Tracks automated response actions

### Automated Response System
- Block IP addresses
- Disable user accounts
- Isolate endpoints
- Send administrator alerts
- Quarantine files
- Update security definitions

## 🎬 Demo Instructions

### End-to-End Threat Simulation

1. **Start the System**
   ```bash
   python run.py
   ```

2. **Access Dashboard**
   - Open `http://localhost:5000`
   - View live statistics and monitoring

3. **Simulate Brute Force Attack**
   - Click "Simulate Attack" on Brute Force Detection card
   - Watch real-time logs appear in the log display
   - Observe AI/ML detection process
   - See high-severity alert generated

4. **Execute Automated Response**
   - Click "Block IP Address" button
   - View confirmation notification
   - Check logs for response execution

5. **Monitor System**
   - Statistics update automatically
   - New logs appear every 10 seconds
   - Alerts remain active until resolved

## 🔍 API Endpoints

- `GET /` - Main dashboard
- `GET /api/stats` - System statistics
- `GET /api/logs` - Recent log entries
- `GET /api/alerts` - Active security alerts
- `GET /api/simulate/<threat_type>` - Simulate threat scenarios
- `POST /api/execute_action` - Execute automated responses

## 🛠️ Technical Implementation

### Backend (Flask + SQLite)
- **Flask Routes**: Handle web requests and API endpoints
- **SQLite Database**: Store logs, alerts, and responses
- **Threading**: Background log generation
- **JSON APIs**: Real-time data exchange

### Frontend (HTML/CSS/JS)
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Fetch API calls every few seconds
- **Interactive UI**: Click-to-simulate threat scenarios
- **Animations**: Visual feedback for threat detection

### Database Schema
```sql
-- Logs table
CREATE TABLE logs (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    source TEXT,
    message TEXT,
    severity TEXT
);

-- Alerts table
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    threat_type TEXT,
    severity TEXT,
    description TEXT,
    status TEXT
);

-- Responses table
CREATE TABLE responses (
    id INTEGER PRIMARY KEY,
    alert_id INTEGER,
    action TEXT,
    timestamp DATETIME
);
```

## 🎯 Key Benefits

- **Full-Stack Solution**: Complete web application with database
- **Real-time Processing**: Live log ingestion and threat detection
- **Scalable Architecture**: Easy to extend with new threat types
- **Database Persistence**: All data stored and retrievable
- **Professional UI**: Modern, responsive dashboard design
- **API-Driven**: RESTful architecture for integration

## 🔮 Future Enhancements

- Machine learning model training with historical data
- Integration with real SIEM systems
- Advanced threat intelligence feeds
- Multi-tenant support
- Email/SMS notification system
- Detailed forensic analysis tools

## 🚨 Security Note

This is a demonstration system for educational purposes. In production environments, implement proper authentication, encryption, and security measures.