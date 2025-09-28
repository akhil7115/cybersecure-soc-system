// Global variables
let activeThreats = 0;
let logsProcessed = 0;
let alertsGenerated = 0;
let logCounter = 0;

// Threat scenarios data
const threatScenarios = {
    'brute-force': {
        name: 'Brute Force Attack',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        severity: 'high',
        logs: [
            'FIREWALL: Failed login attempt from 192.168.1.100 - user: admin',
            'FIREWALL: Failed login attempt from 192.168.1.100 - user: root',
            'FIREWALL: Failed login attempt from 192.168.1.100 - user: administrator',
            'AI/ML: Brute force pattern detected - 15 attempts in 2 minutes'
        ],
        actions: ['Block IP Address', 'Lock User Account', 'Send Alert to Admin']
    },
    'insider-threat': {
        name: 'Insider Privilege Misuse',
        description: 'Employee accessing sensitive files outside normal hours',
        severity: 'medium',
        logs: [
            'ENDPOINT: User john.doe accessed /confidential/payroll.xlsx at 02:30 AM',
            'ENDPOINT: Unusual file access pattern detected for user john.doe',
            'AI/ML: Insider threat behavior pattern identified'
        ],
        actions: ['Disable User Account', 'Notify HR Department', 'Review Access Logs']
    },
    'data-exfiltration': {
        name: 'Data Exfiltration Attempt',
        description: 'Large data transfer to external server detected',
        severity: 'high',
        logs: [
            'CLOUD: Large file upload detected - 2.5GB to external.server.com',
            'ENDPOINT: USB device connected - copying sensitive files',
            'AI/ML: Data exfiltration pattern detected - anomalous data volume'
        ],
        actions: ['Block External Connection', 'Quarantine Files', 'Investigate User Activity']
    },
    'malware': {
        name: 'Malware Indicators',
        description: 'Suspicious process behavior and network connections',
        severity: 'high',
        logs: [
            'ENDPOINT: Suspicious process detected - crypto_miner.exe',
            'FIREWALL: Outbound connection to known malicious IP 45.33.32.156',
            'AI/ML: Malware signature match - 95% confidence'
        ],
        actions: ['Isolate Endpoint', 'Run Full System Scan', 'Update Antivirus Definitions']
    }
};

// Initialize dashboard
function initDashboard() {
    updateStats();
    startLogSimulation();
    
    // Smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Update dashboard statistics
function updateStats() {
    document.getElementById('activeThreats').textContent = activeThreats;
    document.getElementById('logsProcessed').textContent = logsProcessed;
    document.getElementById('alertsGenerated').textContent = alertsGenerated;
}

// Simulate threat detection
function simulateThreat(threatType) {
    const threat = threatScenarios[threatType];
    const card = document.querySelector(`[data-threat="${threatType}"]`);
    
    // Update threat card status
    card.classList.add('detected');
    card.querySelector('.threat-status').textContent = 'THREAT DETECTED!';
    card.querySelector('.threat-status').style.color = '#ff4757';
    
    // Simulate log processing
    threat.logs.forEach((log, index) => {
        setTimeout(() => {
            addLogEntry(log);
        }, index * 1000);
    });
    
    // Generate alert after logs
    setTimeout(() => {
        generateAlert(threat);
        activeThreats++;
        updateStats();
    }, threat.logs.length * 1000);
    
    // Reset card after 10 seconds
    setTimeout(() => {
        card.classList.remove('detected');
        card.querySelector('.threat-status').textContent = 'Monitoring';
        card.querySelector('.threat-status').style.color = '#00ff88';
    }, 10000);
}

// Add log entry to display
function addLogEntry(logText) {
    const logDisplay = document.getElementById('logDisplay');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color: #00ff88;">[${timestamp}]</span> ${logText}`;
    logDisplay.appendChild(logEntry);
    logDisplay.scrollTop = logDisplay.scrollHeight;
    
    logsProcessed++;
    updateStats();
}

// Generate security alert
function generateAlert(threat) {
    const alertsContainer = document.getElementById('alertsContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${threat.severity}`;
    
    const severityColors = {
        high: '#ff4757',
        medium: '#ffa502',
        low: '#2ed573'
    };
    
    alert.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">${threat.name}</div>
            <div class="alert-severity" style="background: ${severityColors[threat.severity]}; color: white;">
                ${threat.severity.toUpperCase()}
            </div>
        </div>
        <div class="alert-description">${threat.description}</div>
        <div class="alert-actions">
            ${threat.actions.map(action => 
                `<button class="action-btn" onclick="executeAction('${action}')">${action}</button>`
            ).join('')}
        </div>
    `;
    
    alertsContainer.insertBefore(alert, alertsContainer.firstChild);
    alertsGenerated++;
    updateStats();
}

// Execute automated response action
function executeAction(action) {
    addLogEntry(`AUTOMATED RESPONSE: ${action} executed successfully`);
    
    // Show success message
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #00ff88;
        color: #1e3c72;
        padding: 1rem;
        border-radius: 5px;
        font-weight: bold;
        z-index: 1001;
    `;
    notification.textContent = `✓ ${action} completed`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// Start continuous log simulation
function startLogSimulation() {
    const normalLogs = [
        'FIREWALL: Normal traffic from 192.168.1.50',
        'ENDPOINT: User login successful - jane.smith',
        'CLOUD: File sync completed - documents folder',
        'FIREWALL: Outbound HTTPS connection allowed',
        'ENDPOINT: Antivirus scan completed - no threats found',
        'CLOUD: Backup process initiated',
        'FIREWALL: VPN connection established',
        'ENDPOINT: Software update installed successfully'
    ];
    
    setInterval(() => {
        if (logCounter % 5 === 0) { // Add normal log every 5 seconds
            const randomLog = normalLogs[Math.floor(Math.random() * normalLogs.length)];
            addLogEntry(randomLog);
        }
        logCounter++;
    }, 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);