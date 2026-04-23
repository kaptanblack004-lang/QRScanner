#!/bin/bash

# =============================================================================
# KaptanBlack Ngrok Kurulum Script'i
# Created by KaptanBlack | Version 1.0
# =============================================================================

# Renkli cikti icin ANSI kodlari
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${CYAN}"
echo "KaptanBlack Ngrok Kurulum Sistemi"
echo -e "${NC}"

# Ngrok kontrol
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}[KURULUM] Ngrok bulunamadi, kuruluyor...${NC}"
    
    # Architekur belirle
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        NGROK_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
    elif [ "$ARCH" = "aarch64" ]; then
        NGROK_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz"
    else
        NGROK_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-386.tgz"
    fi
    
    # Indir
    cd /tmp
    wget -q $NGROK_URL -O ngrok.tgz
    tar -xzf ngrok.tgz
    sudo mv ngrok /usr/local/bin/
    rm -f ngrok.tgz
    
    echo -e "${GREEN}[TAMAM] Ngrok kuruldu${NC}"
else
    echo -e "${GREEN}[TAMAM] Ngrok zaten kurulu${NC}"
fi

# Authtoken kontrol
if [ ! -f "$HOME/.ngrok2/ngrok.yml" ] && [ ! -f "$HOME/.config/ngrok/ngrok.yml" ]; then
    echo ""
    echo -e "${YELLOW}[BILGI] Ngrok authtoken gerekli${NC}"
    echo -e "${WHITE}1. https://dashboard.ngrok.com/signup adresine gidin${NC}"
    echo -e "${WHITE}2. Uye olun ve authtoken alin${NC}"
    echo -e "${WHITE}3. Token'i asagiya yapistirin:${NC}"
    echo ""
    read -p "Ngrok Authtoken: " token
    
    if [ -n "$token" ]; then
        ngrok config add-authtoken $token
        echo -e "${GREEN}[TAMAM] Authtoken kaydedildi${NC}"
    else
        echo -e "${RED}[HATA] Token bos olamaz${NC}"
        exit 1
    fi
fi

# Tunnel baslat
echo ""
echo -e "${CYAN}[BASLATILIYOR] Ngrok tunnel...${NC}"
echo -e "${WHITE}Port 8080 uzaktan erisime aciliyor${NC}"
echo ""

echo -e "${YELLOW}[BILGI] Ngrok baslatildi!${NC}"
echo -e "${WHITE}Public URL'yi kopyalayip Android ayarlarina yapistrin${NC}"
echo ""

ngrok http 8080
