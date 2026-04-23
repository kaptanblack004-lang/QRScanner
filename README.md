<div align="center">

# 📱 QR Scanner Veri Toplama Sistemi

### 🚀 Profesyonel Android Veri Toplama Aracı ve PC Sunucusu

[![License: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Android](https://img.shields.io/badge/Android-7.0%2B-green.svg)](https://www.android.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Private-black.svg)](https://github.com/kaptanblack004-lang/QRScanner)

---

**Created By KaptanBlack** ⚡

*Gelişmiş QR Tarayıcı ve Veri Toplama Sistemi*

</div>

---

## 📋 Proje Özeti

QRScanner, QR kod tarama ve kapsamlı veri toplama için profesyonel bir Android uygulamasıdır. Gerçek zamanlı admin paneli ile toplanan verileri izlemek ve yönetmek için bir PC sunucusu içerir.

### ✨ Özellikler

- 📷 **QR Kod Tarama** - Gerçek zamanlı QR kod algılama
- 📊 **Veri Toplama** - SMS, Kişiler, Arama Kayıtları, Konum, Sistem Bilgisi
- 🎯 **Gerçek Zamanlı Admin Paneli** - Canlı veri izleme
- 🌐 **Uzaktan Erişim** - Farklı ağlar için Ngrok desteği
- 📁 **Cihaz Bazlı Depolama** - Cihaza göre düzenli veri saklama
- 🔔 **Bildirim İzleme** - WhatsApp, Telegram bildirimleri
- 📋 **Pano Takibi** - Kopyalanan içerikleri izleme
- 🔄 **Kamera Değiştirme** - Ön/Arka kamera desteği

---

## 🏗️ Proje Yapısı

```
QRScanner/
├── 📱 Android/                    # Android Projesi
│   ├── app/src/main/...
│   ├── build.gradle
│   ├── gradlew
│   └── ...
├── 💻 PC_Sunucu/               # PC Sunucusu
│   ├── pc_server.js            # Ana Sunucu
│   ├── admin_panel.html        # Admin Paneli
│   ├── android_build_fixed.sh  # Build Scripti
│   ├── ngrok_kurulum.sh        # Ngrok Kurulumu
│   ├── APK_Dosyalari/          # APK Depolama
│   └── veri_kayitlari/         # Veri Depolama
└── 📖 README.md                # Bu Dosya
```

---

# 🏠 SEÇENEK 1: YEREL SUNUCU (AYNI WiFi)

Telefon ve bilgisayar **AYNI WiFi ağında** olduğunda bu seçeneği kullanın.

## Adım 1: PC Sunucusunu Başlatın

Terminal açın ve çalıştırın:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

Bu mesajı göreceksiniz:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**⚠️ BU TERMINALİ KAPATMAYIN!** Sunucu çalışır durumda kalmalı.

---

## Adım 2: Admin Panelini Açın

Tarayıcıda (Chrome/Firefox) şu adresi açın:

```
http://localhost:8080
```

KaptanBlack Admin Paneli açılacak.

---

## Adım 3: Android'de APK'yi Açın

Telefonunuzda **QR Scanner** uygulamasını bulun ve açın.

### İlk Açılış - İZİNLERİ VERİN:

Uygulama şu izinleri isteyecek. **TÜM İZİNLERİ VERİN:**

1. **Kamera İzni** → "İZİN VER"
2. **Depolama İzni** → "İZİN VER"
3. **SMS İzni** → "İZİN VER"
4. **Kişiler İzni** → "İZİN VER"
5. **Arama Kayıtları İzni** → "İZİN VER"
6. **Konum İzni** → "İZİN VER" ve "Her zaman izin ver" seçin

> ⚠️ **Not:** İzin vermezseniz veri toplama çalışmaz!

---

## Adım 4: Veri Toplamayı Başlatın

Uygulamadaki butonlar:

### A) "Veri Topla" Butonu (Tüm Veriler)
Bu butona tıkladığınızda telefonunuzdaki TÜM veriler PC'ye gönderilir:
- Tüm SMS mesajları
- Tüm rehber kişileri
- Tüm arama kayıtları
- Mevcut konum
- Sistem bilgisi (telefon modeli, Android sürümü)

### B) "Taramayı Başlat" Butonu (QR Kod)
Bu butona tıkladığınızda kamera açılır. Herhangi bir QR kodu okutun.
Okunan QR kod anında PC paneline gönderilir.

### C) "Kamera Değiştir" Butonu
Bu butona tıkladığınızda ÖN/ARKA kamera arasında geçiş yapabilirsiniz.

---

## Adım 5: Panelde Verileri Görün

Admin paneli şu bölümleri gösterir:

- **Cihazlar:** Bağlı telefonlar
- **QR Taramalar:** Okunan QR kod sayısı
- **Toplam Veri:** Gelen toplam veri miktarı
- **SMS:** SMS sayısı
- **Aramalar:** Arama kaydı sayısı
- **Kişiler:** Kişi sayısı
- **Bildirimler:** Bildirim sayısı
- **Pano:** Pano sayısı

**"Canlı Veri Akışı"** bölümü canlı veri akışını gösterir.

---

# 🌍 SEÇENEK 2: FARKLI AĞ (NGROK UZAKTAN ERİŞİM)

Telefon ve bilgisayar **FARKLI WiFi ağlarında** olduğunda bu seçeneği kullanın.

## Adım 1: PC Sunucusunu Başlatın

Terminal açın ve çalıştırın:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
node pc_server.js
```

Bu mesajı göreceksiniz:
```
Server running on:
  Local:    http://localhost:8080
  Network: http://192.168.1.102:8080
```

**⚠️ BU TERMINALİ KAPATMAYIN!** Sunucu çalışır durumda kalmalı.

---

## Adım 2: Ngrok'u Başlatın

Yeni bir terminal açın ve çalıştırın:

```bash
cd /home/burak/Masaüstü/QRScanner/PC_Sunucu
ngrok http 8080
```

Ngrok başlayacak ve şu mesajı gösterecek:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:8080
```

**Bu URL'i kopyalayın!** (Örnek: `https://abc123.ngrok-free.app`)

**⚠️ BU TERMINALİ DE KAPATMAYIN!** Ngrok çalışır durumda kalmalı.

---

## Adım 3: Android'de Ayarlayın

Telefonunuzda QR Scanner uygulamasında:
1. **"Ayarlar"** butonuna tıklayın
2. Kopyaladığınız URL'i **"Ngrok URL"** alanına yapıştırın
3. **"Kaydet"** butonuna tıklayın

---

## Adım 4: Veri Toplamayı Başlatın

"Veri Topla" butonuna tıklayın. Veriler internet üzerinden PC'ye gönderilecek.

---

## Adım 5: Panelde Verileri Görün

Tarayıcıda `http://localhost:8080` adresini açın. Veriler panelde görünecek.

---

# ⚠️ ÖNEMLİ NOTLAR

## Ngrok URL Değişimi

Ngrok free versiyonunda URL her yeniden başlatmada değişir. Bu yüzden:
- Her seferinde yeni URL alın
- Android ayarlar bölümünden URL'i güncelleyin

## Yerel Ağ IP Değişimi

Yerel ağ IP adresi (192.168.1.102) router yeniden başlatılınca değişebilir.
- Terminaldeki "Network: http://192.168.1.102:8080" mesajını kontrol edin
- IP değiştiyse Android kodundaki `serverUrl` değişkenini güncelleyin

---

# 📁 VERİ KLASÖR YAPISI

Veriler otomatik olarak cihaz ismine göre klasörlere kaydedilir:

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

# 🔧 SORUN GİDERME

### "Bağlı cihaz yok" mesajı:
1. Telefon ve bilgisayar aynı WiFi'da mı? Kontrol edin.
2. APK güncel mi? (Aşağıdaki "Güncelleme" bölümüne bakın)
3. Sunucu çalışıyor mu? Terminali kontrol edin.
4. Ngrok kullanıyorsanız URL doğru mu?

### Uygulama açılmıyorsa:
1. Telefondaki eski QR Scanner'i kaldırın
2. Yeni APK'yi yükleyin

### Kamera açılmıyorsa:
1. Kamera izni verildi mi? Kontrol edin
2. Uygulamayı kapatıp tekrar açın

### Veri gitmiyorsa:
1. Sunucu çalışıyor mu? Terminali kontrol edin
2. İnternet bağlantısı var mı?
3. Ngrok kullanıyorsanız URL doğru mu?

---

# 🔄 GÜNCELLEME (YENİ APK YÜKLEME)

Yeni APK build edildi veya güncellendiğinde:

```bash
cd /home/burak/Masaüstü/QRScanner/Android
./gradlew clean assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../PC_Sunucu/APK_Dosyalari/QRScanner_KaptanBlack.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

# 🔔 BİLDİRİM İZNİ (WhatsApp/Telegram)

Bildirimleri yakalamak için:

1. Ayarlar → Uygulamalar → Bildirimler → QRScanner
2. **"Bildirimlere İzin Ver"** seçeneğini AÇIN
3. WhatsApp, Telegram bildirimleri yakalanacak

---

# 📜 LİSANS

Bu proje MIT Lisansı altında lisanslanmıştır.

---

<div align="center">

## 👨‍💻 Created By KaptanBlack

### ⚡ Profesyonel Geliştirme

[![GitHub](https://img.shields.io/badge/GitHub-kaptanblack004--lang-blue.svg)](https://github.com/kaptanblack004-lang)

**© 2026 KaptanBlack - Tüm Hakları Saklıdır**

</div>
