// Global variables
let currentAlerts = [];
let threatCounts = {
    'brute-force': 0,
    'insider-threat': 0,
    'data-exfiltration': 0,
    'malware': 0
};
let todayEventCount = 0;

// Initialize dashboard with enhanced animations
function initDashboard() {
    // Add loading animation
    showLoadingAnimation();
    
    // Add ripple effects to buttons
    addRippleEffects();
    
    // Add smooth page transitions
    addPageTransitions();
    
    setTimeout(() => {
        updateStats();
        loadLogs();
        loadAlerts();
        updateThreatCounts();
        updateLastUpdateTime();
        animateStatsCards();
        initializeCharts();
        hideLoadingAnimation();
    }, 1000);
    
    // Set up real-time auto-refresh (optimized intervals)
    setInterval(updateStats, 3000);
    setInterval(loadLogs, 2000);
    setInterval(loadAlerts, 3000);
    setInterval(updateLastUpdateTime, 1000);
    setInterval(updateThreatCounts, 5000);
    setInterval(updateCharts, 4000);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Update dashboard statistics with smooth animations
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Animate number changes
        animateNumber('activeThreats', stats.active_threats);
        animateNumber('logsProcessed', stats.logs_processed);
        animateNumber('alertsGenerated', stats.alerts_generated);
        
        const statusElement = document.getElementById('systemStatus');
        if (statusElement.textContent !== stats.system_status) {
            statusElement.style.transform = 'scale(1.1)';
            statusElement.textContent = stats.system_status;
            setTimeout(() => {
                statusElement.style.transform = 'scale(1)';
            }, 200);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Load recent logs with real-time updates
async function loadLogs() {
    try {
        const response = await fetch('/api/logs');
        const logs = await response.json();
        
        const logDisplay = document.getElementById('logDisplay');
        
        // Only update if we have new logs
        if (logs.length > 0) {
            logDisplay.innerHTML = '';
            
            logs.forEach(log => {
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                const timestamp = new Date(log.timestamp).toLocaleTimeString();
                
                // Add emoji indicators for different log types
                let emoji = '📊';
                const message = log.message || '';
                if (message.includes('Failed login') || message.includes('Brute force')) emoji = '🔐';
                else if (message.includes('Malware') || message.includes('virus')) emoji = '🦠';
                else if (message.includes('Data') || message.includes('transfer')) emoji = '📤';
                else if (message.includes('User') || message.includes('access')) emoji = '👤';
                else if (message.includes('Block') || message.includes('response')) emoji = '⚙️';
                
                logEntry.innerHTML = `
                    <span style="color: #00ff88;">[${timestamp}]</span> 
                    <span style="color: #ffd93d;">${emoji} [${log.source || 'SYSTEM'}]</span> 
                    ${message}
                `;
                logDisplay.appendChild(logEntry);
            });
            
            logDisplay.scrollTop = logDisplay.scrollHeight;
            todayEventCount = logs.length;
            const todayEventsElement = document.getElementById('todayEvents');
            if (todayEventsElement) {
                todayEventsElement.textContent = todayEventCount;
            }
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Load active alerts with real-time counts
async function loadAlerts() {
    try {
        const response = await fetch('/api/alerts');
        const alerts = await response.json();
        
        const alertsContainer = document.getElementById('alertsContainer');
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="no-alerts">
                    <div class="no-alerts-icon">✅</div>
                    <h3>All Clear!</h3>
                    <p>No security threats detected. Your system is safe.</p>
                    <small>Last checked: ${new Date().toLocaleTimeString()}</small>
                </div>
            `;
        } else {
            alertsContainer.innerHTML = '';
            alerts.forEach(alert => {
                const alertElement = createAlertElement(alert);
                alertsContainer.appendChild(alertElement);
            });
        }
        
        // Update alert summary counts
        updateAlertCounts(alerts);
        currentAlerts = alerts;
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Create alert element with user-friendly descriptions
function createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alert.severity}`;
    
    const severityInfo = {
        high: { color: '#ff4757', emoji: '🔴', text: 'URGENT - Act Now!' },
        medium: { color: '#ffa502', emoji: '🟡', text: 'Warning - Review Soon' },
        low: { color: '#2ed573', emoji: '🟢', text: 'Info - For Your Awareness' }
    };
    
    const actions = getActionsForThreat(alert.threat_type);
    const severity = severityInfo[alert.severity];
    
    // Get user-friendly threat description
    const friendlyDescription = getFriendlyThreatDescription(alert.threat_type, alert.description);
    
    alertDiv.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">${severity.emoji} ${alert.threat_type}</div>
            <div class="alert-severity" style="background: ${severity.color}; color: white;">
                ${severity.text}
            </div>
        </div>
        <div class="alert-description">${friendlyDescription}</div>
        <div class="alert-timestamp">🕰️ Detected: ${new Date(alert.timestamp).toLocaleString()}</div>
        <div class="alert-impact">📊 Impact: ${getThreatImpact(alert.severity)}</div>
        <div class="alert-actions">
            <h4>🚑 Recommended Actions:</h4>
            ${actions.map(action => 
                `<button class="action-btn" onclick="executeAction('${action}', ${alert.id})">⚙️ ${action}</button>`
            ).join('')}
        </div>
    `;
    
    return alertDiv;
}

// Get actions for specific threat types with user-friendly names
function getActionsForThreat(threatType) {
    const actionMap = {
        'Brute Force Attack': ['Block Hacker\'s IP Address', 'Lock Compromised Account', 'Alert Security Team'],
        'Insider Privilege Misuse': ['Disable Employee Account', 'Notify HR Department', 'Review File Access History'],
        'Data Exfiltration Attempt': ['Block Data Transfer', 'Secure Sensitive Files', 'Investigate User Activity'],
        'Malware Indicators': ['Isolate Infected Computer', 'Run Virus Scan', 'Update Security Definitions']
    };
    
    return actionMap[threatType] || ['Investigate Issue', 'Block Access', 'Alert Administrator'];
}

// Simulate threat detection with enhanced visual feedback
async function simulateThreat(threatType) {
    const card = document.querySelector(`[data-threat="${threatType}"]`);
    const button = card.querySelector('button');
    
    // Disable button during simulation
    button.disabled = true;
    button.style.opacity = '0.7';
    button.innerHTML = '🔄 Processing...';
    
    // Update threat card status with user-friendly messages
    card.classList.add('detected');
    const statusElement = card.querySelector('.threat-status');
    statusElement.innerHTML = '🚨 THREAT DETECTED! Analyzing...';
    statusElement.style.color = '#ff4757';
    
    // Simplified visual feedback
    document.body.style.background = 'rgba(255, 71, 87, 0.05)';
    setTimeout(() => {
        document.body.style.background = '';
    }, 200);
    
    // Increment threat count
    threatCounts[threatType]++;
    updateThreatCounts();
    
    try {
        const response = await fetch(`/api/simulate/${threatType}`);
        const result = await response.json();
        
        if (result.success) {
            showNotification('🚨 Attack simulation started! Watch the live feed below for real-time detection.');
            
            // Simplified processing status
            statusElement.innerHTML = '✅ Threat processed and blocked!';
            
            // Refresh data after simulation
            setTimeout(() => {
                loadLogs().catch(console.error);
                loadAlerts().catch(console.error);
                updateStats().catch(console.error);
            }, 1500);
        }
    } catch (error) {
        console.error('Error simulating threat:', error);
        showNotification('Error simulating threat', 'error');
    }
    
    // Reset card after 8 seconds
    setTimeout(() => {
        card.classList.remove('detected');
        statusElement.innerHTML = '👁️ Watching for attacks';
        statusElement.style.color = '#00ff88';
        button.disabled = false;
        button.style.opacity = '1';
        button.innerHTML = 'Simulate Attack';
    }, 8000);
}

// Execute automated response action with real-time feedback
async function executeAction(action, alertId) {
    // Show immediate feedback
    showNotification(`⚙️ Executing: ${action}...`);
    
    try {
        const response = await fetch('/api/execute_action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                alert_id: alertId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`✅ SUCCESS: ${action} completed! Your system is now safer.`);
            
            // Refresh logs and alerts to show the action immediately
            setTimeout(() => {
                loadLogs().catch(console.error);
                loadAlerts().catch(console.error);
                updateStats().catch(console.error);
            }, 500);
        }
    } catch (error) {
        console.error('Error executing action:', error);
        showNotification(`❌ Failed to execute ${action}. Please try again.`, 'error');
    }
}

// Update threat counts for dashboard
function updateThreatCounts() {
    const elements = {
        'bruteForceCount': threatCounts['brute-force'],
        'insiderCount': threatCounts['insider-threat'],
        'exfiltrationCount': threatCounts['data-exfiltration'],
        'malwareCount': threatCounts['malware']
    };
    
    Object.entries(elements).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    });
}

// Update last update time
function updateLastUpdateTime() {
    const element = document.getElementById('lastUpdate');
    if (element) {
        element.textContent = new Date().toLocaleTimeString();
    }
}

// Update alert summary counts
function updateAlertCounts(alerts) {
    const counts = { high: 0, medium: 0, low: 0 };
    alerts.forEach(alert => {
        if (alert.severity in counts) {
            counts[alert.severity]++;
        }
    });
    
    const elements = {
        'criticalAlerts': counts.high,
        'warningAlerts': counts.medium,
        'infoAlerts': counts.low
    };
    
    Object.entries(elements).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    });
    
    // Update inline badges
    const badges = {
        'criticalBadge': counts.high,
        'warningBadge': counts.medium,
        'infoBadge': counts.low
    };
    
    Object.entries(badges).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    });
}



// Get user-friendly threat description
function getFriendlyThreatDescription(threatType, originalDescription) {
    const descriptions = {
        'Brute Force Attack': '🚫 Someone is trying to break into an account by guessing passwords repeatedly. This could be a hacker trying to steal login credentials.',
        'Insider Privilege Misuse': '👤 An employee or insider is accessing files or systems they shouldn\'t have access to. This might be accidental or intentional data theft.',
        'Data Exfiltration Attempt': '📤 Large amounts of data are being copied or sent outside your network. This could be someone stealing sensitive company information.',
        'Malware Indicators': '🦠 We found signs of malicious software (viruses) on your system. This could damage files or steal information if not stopped.'
    };
    
    return descriptions[threatType] || originalDescription;
}

// Get threat impact description
function getThreatImpact(severity) {
    const impacts = {
        high: 'Could cause serious damage to your business - immediate action required',
        medium: 'May affect business operations - should be addressed soon',
        low: 'Minor issue - monitor and review when convenient'
    };
    
    return impacts[severity] || 'Unknown impact level';
}

// Enhanced notification system with animations
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let emoji = '✅';
    let gradient = 'linear-gradient(45deg, var(--cyber-green), #00e676)';
    
    if (type === 'error') {
        gradient = 'linear-gradient(45deg, var(--cyber-red), #ff6b6b)';
        notification.style.color = 'white';
        emoji = '❌';
    }
    
    notification.style.background = gradient;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem; animation: bounce 0.5s ease;">${emoji}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add subtle vibration effect for mobile
    if (navigator.vibrate) {
        navigator.vibrate(type === 'error' ? [100, 50, 100] : [50]);
    }
    
    // Add exit animation
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'notificationExit 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Simplified number animation
function animateNumber(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue !== newValue) {
        element.style.transition = 'transform 0.2s ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = newValue;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

// Simplified stats cards animation
function animateStatsCards() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Simplified loading animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 10, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="text-align: center; color: var(--cyber-blue);">
                <h3>🛡️ Initializing CyberSecure SOC...</h3>
                <p>Loading threat detection systems</p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoadingAnimation() {
    const loader = document.getElementById('loader');
    if (loader && document.body.contains(loader)) {
        document.body.removeChild(loader);
    }
}

// Particle effect removed for better performance

// Add ripple effect to buttons
function addRippleEffects() {
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const button = e.target;
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (button.contains(ripple)) {
                    button.removeChild(ripple);
                }
            }, 600);
        }
    });
}

// Add smooth page transitions
function addPageTransitions() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('page-transition');
    });
    
    // Intersection Observer for smooth reveals
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Chart instances
let charts = {};

// Initialize all charts
function initializeCharts() {
    initThreatTimelineChart();
    initThreatDistributionChart();
    initSystemPerformanceChart();
    initGeographicChart();
    initNetworkTrafficChart();
    initSecurityScoreChart();
}

// Threat Timeline Chart
function initThreatTimelineChart() {
    const ctx = document.getElementById('threatTimelineChart');
    if (!ctx) return;
    
    charts.threatTimeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Brute Force',
                data: [],
                borderColor: '#ff4757',
                backgroundColor: 'rgba(255, 71, 87, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Malware',
                data: [],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Data Theft',
                data: [],
                borderColor: '#ffa502',
                backgroundColor: 'rgba(255, 165, 2, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// Threat Distribution Chart
function initThreatDistributionChart() {
    const ctx = document.getElementById('threatDistributionChart');
    if (!ctx) return;
    
    charts.threatDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Brute Force', 'Malware', 'Data Theft', 'Insider Threat'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    '#ff4757',
                    '#ff6b6b', 
                    '#ffa502',
                    '#2ed573'
                ],
                borderWidth: 2,
                borderColor: '#1a1a1a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff', padding: 20 }
                }
            }
        }
    });
}

// System Performance Chart
function initSystemPerformanceChart() {
    const ctx = document.getElementById('systemPerformanceChart');
    if (!ctx) return;
    
    charts.systemPerformance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['CPU', 'Memory', 'Network', 'Disk', 'Security', 'Uptime'],
            datasets: [{
                label: 'Current',
                data: [85, 70, 90, 65, 95, 98],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#ffffff',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                r: {
                    ticks: { color: '#b8c6db', backdropColor: 'transparent' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#ffffff' }
                }
            }
        }
    });
}

// Geographic Threats Chart
function initGeographicChart() {
    const ctx = document.getElementById('geographicChart');
    if (!ctx) return;
    
    charts.geographic = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['USA', 'China', 'Russia', 'Brazil', 'India', 'Germany'],
            datasets: [{
                label: 'Threat Origins',
                data: [45, 38, 32, 28, 25, 18],
                backgroundColor: [
                    '#ff4757',
                    '#ff6b6b',
                    '#ffa502',
                    '#2ed573',
                    '#00d4ff',
                    '#8b5cf6'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// Network Traffic Chart
function initNetworkTrafficChart() {
    const ctx = document.getElementById('networkTrafficChart');
    if (!ctx) return;
    
    charts.networkTraffic = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Inbound (MB/s)',
                data: [],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Outbound (MB/s)',
                data: [],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#b8c6db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// Security Score Chart
function initSecurityScoreChart() {
    const ctx = document.getElementById('securityScoreChart');
    if (!ctx) return;
    
    charts.securityScore = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [94, 6],
                backgroundColor: ['#00ff88', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        },
        plugins: [{
            beforeDraw: function(chart) {
                const width = chart.width,
                      height = chart.height,
                      ctx = chart.ctx;
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#00ff88";
                const text = "94%",
                      textX = Math.round((width - ctx.measureText(text).width) / 2),
                      textY = height / 2;
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

// Update charts with real-time data
function updateCharts() {
    fetchChartData();
    updateThreatTimelineChart();
    updateNetworkTrafficChart();
    updateSystemPerformanceChart();
}

// Fetch chart data from API
async function fetchChartData() {
    try {
        const response = await fetch('/api/chart_data');
        const data = await response.json();
        
        // Update threat distribution chart
        if (charts.threatDistribution && data.threat_distribution) {
            const labels = Object.keys(data.threat_distribution);
            const values = Object.values(data.threat_distribution);
            
            if (labels.length > 0) {
                charts.threatDistribution.data.labels = labels;
                charts.threatDistribution.data.datasets[0].data = values;
                charts.threatDistribution.update('none');
            }
        }
        
        // Update geographic chart
        if (charts.geographic && data.geographic_data) {
            const labels = Object.keys(data.geographic_data);
            const values = Object.values(data.geographic_data);
            
            charts.geographic.data.labels = labels;
            charts.geographic.data.datasets[0].data = values;
            charts.geographic.update('none');
        }
        
        // Update performance chart
        if (charts.systemPerformance && data.performance_data) {
            const values = Object.values(data.performance_data);
            charts.systemPerformance.data.datasets[0].data = values;
            charts.systemPerformance.update('none');
        }
        
        // Update security score
        if (charts.securityScore && data.security_score) {
            const score = data.security_score;
            charts.securityScore.data.datasets[0].data = [score, 100 - score];
            
            // Update the chart status
            const statusElement = document.querySelector('#analytics .chart-container:last-child .chart-status');
            if (statusElement) {
                statusElement.textContent = `Current: ${score}%`;
            }
            
            charts.securityScore.update('none');
        }
        
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

// Update threat timeline with new data
function updateThreatTimelineChart() {
    if (!charts.threatTimeline) return;
    
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    // Add new data point
    charts.threatTimeline.data.labels.push(timeLabel);
    charts.threatTimeline.data.datasets[0].data.push(Math.floor(Math.random() * 10));
    charts.threatTimeline.data.datasets[1].data.push(Math.floor(Math.random() * 8));
    charts.threatTimeline.data.datasets[2].data.push(Math.floor(Math.random() * 6));
    
    // Keep only last 10 data points
    if (charts.threatTimeline.data.labels.length > 10) {
        charts.threatTimeline.data.labels.shift();
        charts.threatTimeline.data.datasets.forEach(dataset => dataset.data.shift());
    }
    
    charts.threatTimeline.update('none');
}

// Update network traffic chart
function updateNetworkTrafficChart() {
    if (!charts.networkTraffic) return;
    
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    charts.networkTraffic.data.labels.push(timeLabel);
    charts.networkTraffic.data.datasets[0].data.push((Math.random() * 50 + 20).toFixed(1));
    charts.networkTraffic.data.datasets[1].data.push((Math.random() * 30 + 10).toFixed(1));
    
    if (charts.networkTraffic.data.labels.length > 15) {
        charts.networkTraffic.data.labels.shift();
        charts.networkTraffic.data.datasets.forEach(dataset => dataset.data.shift());
    }
    
    charts.networkTraffic.update('none');
}

// Update system performance chart
function updateSystemPerformanceChart() {
    if (!charts.systemPerformance) return;
    
    // Simulate performance fluctuations
    const newData = charts.systemPerformance.data.datasets[0].data.map(value => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, value + change));
    });
    
    charts.systemPerformance.data.datasets[0].data = newData;
    charts.systemPerformance.update('none');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
    
    @keyframes cardPop {
        0% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
        }
        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes notificationExit {
        to {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes statusPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes rippleExpand {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
    
    @keyframes screenFlash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes slideInFromLeft {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);



// Open chart details page
function openChartDetails(chartType) {
    window.open(`/chart/${chartType}`, '_blank');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Add enhanced interactions and accessibility
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open notifications
            document.querySelectorAll('.notification').forEach(notification => {
                notification.style.animation = 'notificationExit 0.3s ease-in forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            });
        }
    });
    
    // Simplified hover effects
    document.querySelectorAll('.stat-card, .detection-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                card.style.transition = 'transform 0.2s ease';
                card.style.transform = 'translateY(-3px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Simplified loading states
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) {
                button.style.opacity = '0.7';
                setTimeout(() => {
                    button.style.opacity = '1';
                }, 500);
            }
        });
    });
    
    // Simplified reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.detection-card, .alert').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(card);
    });
});