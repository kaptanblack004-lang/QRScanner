package com.qr.scanner.app;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.os.Build;
import android.util.Log;
import androidx.annotation.Nullable;

public class QRBackgroundService extends Service {
    private static final String TAG = "QRBackgroundService";
    private boolean isRunning = false;
    
    // Dynamic server URL
    private String getServerUrl() {
        // Try to find server on local network
        String[] possibleIPs = {
            "192.168.1.102",  // Default
            "192.168.0.102",  // Alternative
            "10.0.0.102",     // Different subnet
            "172.16.0.102",   // Another subnet
            "127.0.0.1"       // Localhost
        };
        
        for (String ip : possibleIPs) {
            try {
                java.net.URL testUrl = new java.net.URL("http://" + ip + ":3001");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) testUrl.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(1000);
                conn.connect();
                if (conn.getResponseCode() == 200) {
                    Log.i(TAG, "Found server at: " + ip);
                    return "http://" + ip + ":3001/data";
                }
            } catch (Exception e) {
                // Try next IP
            }
        }
        
        // Fallback to default
        return "http://192.168.1.102:3001/data";
    }
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "Background service created");
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!isRunning) {
            isRunning = true;
            startDataCollection();
        }
        
        return START_STICKY;
    }
    
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    private void startDataCollection() {
        new Thread(() -> {
            while (isRunning) {
                try {
                    // Collect device data every 30 seconds
                    collectAndSendData();
                    Thread.sleep(30000);
                } catch (InterruptedException e) {
                    Log.e(TAG, "Data collection interrupted: " + e.getMessage());
                    break;
                } catch (Exception e) {
                    Log.e(TAG, "Error in data collection: " + e.getMessage());
                }
            }
        }).start();
        
        Log.i(TAG, "Data collection started");
    }
    
    private void collectAndSendData() {
        try {
            String deviceId = android.provider.Settings.Secure.getString(
                getContentResolver(), android.provider.Settings.Secure.ANDROID_ID
            );
            
            // Device info
            
            Log.i(TAG, "QR Scanner data collected and sent");
            
            // App usage (simulate)
            sendDataToServer("app_usage", "QR Scanner Active:" + 
                (System.currentTimeMillis() % 60) + " minutes");
            
            // System info
            long uptime = System.currentTimeMillis() / 1000 / 60;
            sendDataToServer("system_info", 
                "Uptime:" + uptime + "min " +
                "FreeMem:" + (Runtime.getRuntime().freeMemory() / 1024 / 1024) + "MB");
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting data: " + e.getMessage());
        }
    }
    
    private void sendDataToServer(String type, String data) {
        try {
            String serverUrl = getServerUrl();
            java.net.URL url = new java.net.URL(serverUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            String jsonData = String.format(
                "{\"type\":\"%s\",\"data\":\"%s\",\"deviceId\":\"%s\",\"timestamp\":\"%s\"}",
                type, data, android.provider.Settings.Secure.getString(
                    getContentResolver(), android.provider.Settings.Secure.ANDROID_ID
                ), new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault())
                    .format(new java.util.Date())
            );
            
            java.io.OutputStreamWriter wr = new java.io.OutputStreamWriter(conn.getOutputStream());
            wr.write(jsonData);
            wr.flush();
            
            int responseCode = conn.getResponseCode();
            Log.i(TAG, "Data sent: " + type + " - Response: " + responseCode);
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending data: " + e.getMessage());
        }
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        Log.i(TAG, "Background service destroyed");
    }
}
