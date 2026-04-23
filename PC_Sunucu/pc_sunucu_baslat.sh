#!/bin/bash

# =============================================================================
# KaptanBlack PC Sunucu Baþlat Script'i
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
                                                   
                PROFESSIONAL ADMIN PANEL
                Created by KaptanBlack
EOF
echo -e "${NC}"

echo -e "${YELLOW}=============================================================================${NC}"
echo -e "${WHITE}[KAPTANBLACK] PC Sunucu Baþlatma Sistemi${NC}"
echo -e "${YELLOW}=============================================================================${NC}"
echo ""

# Kontrol et
if [ ! -f "pc_server.js" ]; then
    echo -e "${RED}[HATA] pc_server.js dosyasý bulunamadý!${NC}"
    echo -e "${RED}[HATA] Lütfen doðru dizinde olduðunuzdan emin olun.${NC}"
    exit 1
fi

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${RED}[HATA] Node.js kurulu deðil!${NC}"
    echo -e "${YELLOW}[BILGI] Node.js kurmak için:${NC}"
    echo -e "${CYAN}        sudo apt update && sudo apt install nodejs npm${NC}"
    exit 1
fi

# Dependencies kontrolü
echo -e "${BLUE}[KONTROL] Dependencies kontrol ediliyor...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[UYARI] node_modules bulunamadý, kuruluyor...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[BAÞARILI] Dependencies yüklendi${NC}"
    else
        echo -e "${RED}[HATA] Dependencies yüklenemedi!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[TAMAM] Dependencies mevcut${NC}"
fi

echo ""
echo -e "${PURPLE}[BAÞLATILIYOR] KaptanBlack PC Sunucusu${NC}"
echo -e "${YELLOW}=============================================================================${NC}"
echo ""

# Sunucuyu baþlat
echo -e "${CYAN}[INFO] Sunucu baþlatýlýyor...${NC}"
echo -e "${WHITE}[INFO] Admin Panel: http://localhost:8080${NC}"
echo -e "${WHITE}[INFO] Að Eriþim: http://192.168.1.102:8080${NC}"
echo -e "${WHITE}[INFO] Durdurmak için: Ctrl+C${NC}"
echo ""

# Çalýþma süresi sayacý
start_time=$(date +%s)

# Sunucuyu arka planda baþlat ve log göster
node pc_server.js &
server_pid=$!

# PID göster
echo -e "${GREEN}[BAÞARILI] Sunucu baþlatýldý!${NC}"
echo -e "${WHITE}[PID] $server_pid${NC}"
echo ""

# Gerçek zamanlý log göster
echo -e "${CYAN}[CANLI LOG] Sunucu loglarý:${NC}"
echo -e "${YELLOW}=============================================================================${NC}"

# Sunucu çýkýþýný izle
wait $server_pid

# Sunucu durduðunda
end_time=$(date +%s)
runtime=$((end_time - start_time))
echo ""
echo -e "${YELLOW}[BÝLGÝ] Sunucu durduruldu${NC}"
echo -e "${WHITE}[SÜRE] Çalýþma süresi: $runtime saniye${NC}"
echo -e "${PURPLE}[KAPTANBLACK] Teþekkürler!${NC}"
