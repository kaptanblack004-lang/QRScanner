#!/bin/bash

# =============================================================================
# KaptanBlack QR Scanner Build Script'i
# Created by KaptanBlack | Version 2.0
# =============================================================================

# Renkli çýktý için ANSI kodlarý
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${CYAN}"
cat << "EOF"
 _____ _               _    _            _   _     
|  __ (_)             | |  | |          | | | |    
| |__) |__   ___  _ __| | _| | __ _  ___| | | |___ 
|  _  / \ \ / / \| '__| |/ / |/ _` |/ __| | | / _ \
| | \ \  \ V /| | | |   <| | (_| | (__| |_| |  __/
|_|  \_\  \_/ |_|_|_|\_|\_|\__,_|\___|\___/ \___|
                                                   
                QR SCANNER BUILD SYSTEM
                Created by KaptanBlack
EOF
echo -e "${NC}"

echo -e "${YELLOW}=============================================================================${NC}"
echo -e "${WHITE}[KAPTANBLACK] QR Scanner Build Sistemi${NC}"
echo -e "${YELLOW}=============================================================================${NC}"
echo ""

# Android proje kontrolü
ANDROID_DIR="../Android"
if [ ! -d "$ANDROID_DIR" ]; then
    echo -e "${RED}[HATA] Android proje dizini bulunamadý: $ANDROID_DIR${NC}"
    echo -e "${RED}[HATA] QR Scanner projesi bulunamadý!${NC}"
    exit 1
fi

echo -e "${BLUE}[KONTROL] QR Scanner projesi bulundu${NC}"
echo -e "${WHITE}[DIZIN] $ANDROID_DIR${NC}"
echo ""

# Gradle kontrolü
if [ ! -f "$ANDROID_DIR/gradlew" ]; then
    echo -e "${RED}[HATA] Gradle wrapper bulunamadý!${NC}"
    echo -e "${YELLOW}[BILGI] Android projesi doðru mu?${NC}"
    exit 1
fi

# Java kontrolü
if ! command -v java &> /dev/null; then
    echo -e "${RED}[HATA] Java JDK kurulu deðil!${NC}"
    echo -e "${YELLOW}[BILGI] Java kurmak için:${NC}"
    echo -e "${CYAN}        sudo apt update && sudo apt install openjdk-11-jdk${NC}"
    exit 1
fi

echo -e "${GREEN}[TAMAM] Gerekli araçlar mevcut${NC}"
echo ""

# Build seçenekleri
echo -e "${PURPLE}[BUILD] Build türü seçin:${NC}"
echo -e "${YELLOW}1)${NC} Debug APK (Test için)"
echo -e "${YELLOW}2)${NC} Release APK (Production için)"
echo -e "${YELLOW}3)${NC} Temizle + Debug APK"
echo -e "${YELLOW}4)${NC} Sadece Temizle"
echo ""
read -p "Seçiminiz (1-4): " choice

case $choice in
    1)
        BUILD_TYPE="debug"
        BUILD_COMMAND="./gradlew assembleDebug"
        ;;
    2)
        BUILD_TYPE="release"
        BUILD_COMMAND="./gradlew assembleRelease"
        ;;
    3)
        BUILD_TYPE="clean_debug"
        BUILD_COMMAND="./gradlew clean assembleDebug"
        ;;
    4)
        BUILD_TYPE="clean"
        BUILD_COMMAND="./gradlew clean"
        ;;
    *)
        echo -e "${RED}[HATA] Geçersiz seçim!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}[INFO] Seçilen: $BUILD_TYPE${NC}"
echo -e "${YELLOW}=============================================================================${NC}"
echo ""

# Android dizinine geç
cd "$ANDROID_DIR"

# Build baþlat
start_time=$(date +%s)
echo -e "${BLUE}[BAÞLATILIYOR] QR Scanner Build${NC}"
echo -e "${WHITE}[KOMUT] $BUILD_COMMAND${NC}"
echo ""

# Build çalýþtýr
eval $BUILD_COMMAND
build_result=$?

end_time=$(date +%s)
runtime=$((end_time - start_time))

echo ""
if [ $build_result -eq 0 ]; then
    echo -e "${GREEN}[BAÞARILI] Build tamamlandý!${NC}"
    echo -e "${WHITE}[SÜRE] $runtime saniye${NC}"
    
    # APK dosyalarýný göster
    if [ "$BUILD_TYPE" != "clean" ]; then
        echo ""
        echo -e "${CYAN}[APK] Oluþturulan APK dosyalarý:${NC}"
        
        if [ "$BUILD_TYPE" = "debug" ] || [ "$BUILD_TYPE" = "clean_debug" ]; then
            APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        else
            APK_PATH="app/build/outputs/apk/release/app-release.apk"
        fi
        
        if [ -f "$APK_PATH" ]; then
            APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
            echo -e "${GREEN}[DOSYA] $APK_PATH${NC}"
            echo -e "${WHITE}[BOYUT] $APK_SIZE${NC}"
            
            # APK'yi PC_Sunucu klasörüne kopyala
            APK_NAME="qr_scanner_kaptanblack_$(date +%Y%m%d_%H%M%S).apk"
            cp "$APK_PATH" "../PC_Sunucu/APK_Dosyalari/$APK_NAME"
            echo -e "${GREEN}[KOPYALANDI] APK_Dosyalari/$APK_NAME${NC}"
            
            echo ""
            echo -e "${PURPLE}[KURULUM] APK kurulumu için:${NC}"
            echo -e "${CYAN}        adb install -r $APK_PATH${NC}"
            echo ""
            echo -e "${PURPLE}[WEB] Web üzerinden kurulum için:${NC}"
            echo -e "${CYAN}        Sunucuyu baþlat -> http://localhost:8080/download${NC}"
        else
            echo -e "${RED}[UYARI] APK dosyasý bulunamadý!${NC}"
        fi
    fi
else
    echo -e "${RED}[HATA] Build baþarýsýz!${NC}"
    echo -e "${WHITE}[SÜRE] $runtime saniye${NC}"
fi

echo ""
echo -e "${YELLOW}=============================================================================${NC}"
echo -e "${PURPLE}[KAPTANBLACK] Build tamamlandý!${NC}"
echo -e "${WHITE}[CREATED BY] KaptanBlack Professional Development${NC}"
echo -e "${YELLOW}=============================================================================${NC}"
