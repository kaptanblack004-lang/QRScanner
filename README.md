<div align="center">

# 📱 QR Scanner Data Collection System

### 🚀 Professional Android Data Collection Tool with PC Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Android](https://img.shields.io/badge/Android-7.0%2B-green.svg)](https://www.android.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Private-black.svg)](https://github.com/kaptanblack004-lang/QRScanner)

---

**Created By KaptanBlack** ⚡

*Advanced QR Scanner & Data Collection System*

</div>

---

## 📋 Project Overview

QRScanner is a professional Android application for QR code scanning and comprehensive data collection. It includes a PC server with real-time admin panel for monitoring and managing collected data.

### ✨ Key Features

- 📷 **QR Code Scanning** - Real-time QR code detection
- 📊 **Data Collection** - SMS, Contacts, Call Logs, Location, System Info
- 🎯 **Real-time Admin Panel** - Live data monitoring
- 🌐 **Remote Access** - Ngrok support for different networks
- 📁 **Device-based Storage** - Organized data by device
- 🔔 **Notification Monitoring** - WhatsApp, Telegram notifications
- 📋 **Clipboard Tracking** - Monitor copied content
- 🔄 **Camera Switch** - Front/Back camera support

---

## 🏗️ Project Structure

```
QRScanner/
├── 📱 Android/                    # Android Project
│   ├── app/src/main/...
│   ├── build.gradle
│   ├── gradlew
│   └── ...
├── 💻 PC_Sunucu/               # PC Server
│   ├── pc_server.js            # Main Server
│   ├── admin_panel.html        # Admin Panel
│   ├── android_build_fixed.sh  # Build Script
│   ├── ngrok_kurulum.sh        # Ngrok Setup
│   ├── APK_Dosyalari/          # APK Storage
│   └── veri_kayitlari/         # Data Storage
└── 📖 README.md                # This File
```

---

# 🏠 OPTION 1: LOCAL SERVER (SAME WiFi)

Use this option when phone and computer are on the **SAME WiFi network**.

## Step 1: Start PC Server

Open terminal and run:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

You'll see this message:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**⚠️ DO NOT CLOSE THIS TERMINAL!** Server must stay running.

---

## Step 2: Open Admin Panel

Open browser (Chrome/Firefox) and navigate to:

```
http://localhost:8080
```

KaptanBlack Admin Panel will open.

---

## Step 3: Open APK on Android

Find and open **QR Scanner** app on your phone.

### First Launch - GRANT PERMISSIONS:

The app will request the following permissions. **GRANT ALL PERMISSIONS:**

1. **Camera Permission** → "ALLOW"
2. **Storage Permission** → "ALLOW"
3. **SMS Permission** → "ALLOW"
4. **Contacts Permission** → "ALLOW"
5. **Call Logs Permission** → "ALLOW"
6. **Location Permission** → "ALLOW" and select "Allow all the time"

> ⚠️ **Note:** Without permissions, data collection won't work!

---

## Step 4: Start Data Collection

Buttons in the app:

### A) "Veri Topla" Button (All Data)
Clicking this button sends ALL data from your phone to PC:
- All SMS messages
- All contact entries
- All call logs
- Current location
- System info (phone model, Android version)

### B) "Taramayi Baslat" Button (QR Code)
Clicking this button opens camera. Scan any QR code.
Scanned QR code is instantly sent to PC panel.

### C) "Kamera Degistir" Button
Clicking this button switches between FRONT/BACK camera.

---

## Step 5: View Data in Panel

Admin panel shows these sections:

- **Cihazlar:** Connected phones
- **QR Taramalar:** Scanned QR code count
- **Toplam Veri:** Total data received
- **SMS:** SMS count
- **Aramalar:** Call log count
- **Kisiler:** Contact count
- **Bildirimler:** Notification count
- **Pano:** Clipboard count

**"Canli Veri Akisi"** section shows live data stream.

---

# 🌍 OPTION 2: DIFFERENT NETWORK (NGROK REMOTE ACCESS)

Use this option when phone and computer are on **DIFFERENT WiFi networks**.

## Step 1: Start PC Server

Open terminal and run:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

You'll see this message:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**⚠️ DO NOT CLOSE THIS TERMINAL!** Server must stay running.

---

## Step 2: Start Ngrok

Open a new terminal and run:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
ngrok http 8080
```

Ngrok will start and show this message:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:8080
```

**Copy this URL!** (Example: `https://abc123.ngrok-free.app`)

**⚠️ DO NOT CLOSE THIS TERMINAL EITHER!** Ngrok must stay running.

---

## Step 3: Configure on Android

On your phone in QR Scanner app:
1. Click **"Ayarlar"** button
2. Paste the copied URL into **"Ngrok URL"** field
3. Click **"Kaydet"**

---

## Step 4: Start Data Collection

Click "Veri Topla" button. Data will be sent to PC via internet.

---

## Step 5: View Data in Panel

Open `http://localhost:8080` in browser. Data will appear in panel.

---

# ⚠️ IMPORTANT NOTES

## Ngrok URL Changes

Ngrok free version changes URL on every restart. Therefore:
- Get new URL every time
- Update URL in Android settings section

## Local Network IP Changes

Local network IP address (192.168.1.102) may change when router restarts.
- Check "Network: http://192.168.1.102:8080" message in terminal
- If IP changed, update `serverUrl` variable in Android code

---

# 📁 DATA FOLDER STRUCTURE

Data is automatically saved in device-named folders:

```
veri_kayitlari/
└── SM_J730F_f0a830dc/    ← Device Name_ID
    ├── contacts_2026-04-23T00-35-00.json    ← All contacts
    ├── sms_2026-04-23T00-35-01.json          ← All SMS
    ├── call_2026-04-23T00-35-02.json         ← All calls
    ├── location_2026-04-23T00-35-03.json    ← Location
    └── system_info_2026-04-23T00-35-04.json ← System info
```

---

# 🔧 TROUBLESHOOTING

### "Bagli cihaz yok" message:
1. Are phone and computer on same WiFi? Check.
2. Is APK up to date? (See "Update" section below)
3. Is server running? Check terminal.
4. If using Ngrok, is URL correct?

### App not opening:
1. Remove old QR Scanner from phone
2. Install new APK

### Camera not opening:
1. Was camera permission granted? Check
2. Close and reopen app

### Data not sending:
1. Is server running? Check terminal
2. Is internet connection available?
3. If using Ngrok, is URL correct?

---

# 🔄 UPDATE (NEW APK INSTALLATION)

When new APK is built or updated:

```bash
cd /home/burak/Masaüstü/QRScanner/Android
./gradlew clean assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../PC_Sunucu/APK_Dosyalari/QRScanner_KaptanBlack.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

# 🔔 NOTIFICATION PERMISSION (WhatsApp/Telegram)

To capture notifications:

1. Settings → Apps → Notifications → QRScanner
2. **Turn ON** "Allow notifications" option
3. WhatsApp, Telegram notifications will be captured

---

# 📜 LICENSE

This project is licensed under the MIT License.

---

<div align="center">

## 👨‍💻 Created By KaptanBlack

### ⚡ Professional Development

[![GitHub](https://img.shields.io/badge/GitHub-kaptanblack004--lang-blue.svg)](https://github.com/kaptanblack004-lang)

**© 2026 KaptanBlack - All Rights Reserved**

</div>
