package com.qr.scanner.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class SettingsActivity extends AppCompatActivity {
    
    private EditText serverUrlInput;
    private EditText ngrokUrlInput;
    private Button saveButton;
    private Button testConnectionButton;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);
        
        serverUrlInput = findViewById(R.id.serverUrlInput);
        ngrokUrlInput = findViewById(R.id.ngrokUrlInput);
        saveButton = findViewById(R.id.saveButton);
        testConnectionButton = findViewById(R.id.testConnectionButton);
        
        loadSettings();
        
        saveButton.setOnClickListener(v -> saveSettings());
        testConnectionButton.setOnClickListener(v -> testConnection());
    }
    
    private void loadSettings() {
        SharedPreferences prefs = getSharedPreferences("QRScannerPrefs", Context.MODE_PRIVATE);
        serverUrlInput.setText(prefs.getString("server_url", "http://192.168.1.102:8080"));
        ngrokUrlInput.setText(prefs.getString("ngrok_url", ""));
    }
    
    private void saveSettings() {
        SharedPreferences prefs = getSharedPreferences("QRScannerPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("server_url", serverUrlInput.getText().toString());
        editor.putString("ngrok_url", ngrokUrlInput.getText().toString());
        editor.apply();
        
        Toast.makeText(this, "Ayarlar kaydedildi!", Toast.LENGTH_SHORT).show();
        finish();
    }
    
    private void testConnection() {
        Toast.makeText(this, "Baglanti test ediliyor...", Toast.LENGTH_SHORT).show();
        
        new Thread(() -> {
            try {
                String url = serverUrlInput.getText().toString();
                java.net.URL testUrl = new java.net.URL(url);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) testUrl.openConnection();
                conn.setConnectTimeout(5000);
                conn.connect();
                
                int code = conn.getResponseCode();
                runOnUiThread(() -> {
                    if (code == 200) {
                        Toast.makeText(this, "Baglanti basarili!", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(this, "Baglanti hatasi: " + code, Toast.LENGTH_SHORT).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(this, "Baglanti basarisiz: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }).start();
    }
}
