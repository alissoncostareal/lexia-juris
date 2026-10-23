#!/bin/bash
# ==============================================================================
# LexIA Juris — Script de Deploy Automatizado na VPS (Linux / Ubuntu / Debian)
# Sobe o App Node.js + Ollama Local com Qwen 2.5 (7B)
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}       ⚖️  LexIA Juris — Implantação Automatizada na VPS       ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Verifica se Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[!] Docker não encontrado. Instalando Docker oficial...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}[✔] Docker instalado com sucesso.${NC}"
fi

# Determina comando do Compose (docker compose ou docker-compose legado)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${YELLOW}[!] Instalando plugin Docker Compose...${NC}"
    apt-get update && apt-get install -y docker-compose-plugin || true
    DOCKER_COMPOSE="docker compose"
fi

echo -e "${GREEN}[✔] Docker e Compose prontos.${NC}"

# 2. Subir containers em segundo plano
echo -e "${CYAN}[*] Construindo imagens e subindo serviços (Backend Node.js + Ollama)...${NC}"
$DOCKER_COMPOSE up -d --build

# 3. Aguardar Ollama inicializar
echo -e "${CYAN}[*] Aguardando o serviço Ollama iniciar...${NC}"
MAX_WAIT=30
WAITED=0
until docker exec lexia-ollama ollama --version &> /dev/null || [ $WAITED -ge $MAX_WAIT ]; do
    sleep 2
    WAITED=$((WAITED+2))
    echo -n "."
done
echo ""

# 4. Baixar modelo Qwen 2.5 (7B) dentro do container Ollama
echo -e "${CYAN}[*] Baixando modelo LLM local: qwen2.5:7b...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos dependendo da sua conexão na VPS (~4.7 GB).${NC}"
docker exec -i lexia-ollama ollama pull qwen2.5:7b

# 5. Obter IP público da VPS
PUBLIC_IP=$(curl -s --max-time 4 ifconfig.me || curl -s --max-time 4 api.ipify.org || echo "SEU_IP_VPS")

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}       🎉 DEPLOY CONCLUÍDO COM SUCESSO!                          ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "Acesse o LexIA Juris no seu navegador ou tablet:"
echo -e "👉  ${CYAN}http://${PUBLIC_IP}:3460${NC}"
echo -e ""
echo -e "Status dos Serviços:"
echo -e "  • Backend & Web: ${GREEN}http://${PUBLIC_IP}:3460${NC}"
echo -e "  • Ollama Local:  ${GREEN}http://${PUBLIC_IP}:11434${NC}"
echo -e "  • Modelo Ativo:  ${GREEN}qwen2.5:7b${NC} (Raciocínio jurídico em Português)"
echo -e ""
echo -e "📱 Para usar no Tablet / Celular fora de casa:"
echo -e "  1. Acesse ${CYAN}http://${PUBLIC_IP}:3460${NC} no Chrome/Edge do tablet"
echo -e "     ou"
echo -e "  2. No app/APK, abra o menu lateral (⚙️ Sincronização) e informe:"
echo -e "     Servidor VPS: ${CYAN}http://${PUBLIC_IP}:3460${NC}"
echo -e "${GREEN}================================================================${NC}\n"
