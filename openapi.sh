#!/bin/bash

BACKEND_URL="http://localhost:8000/docs/api.json"
OUTPUT="Frontend/src/types/api.d.ts"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  Gerador de Tipos OpenAPI — SoloTrack"
echo "=========================================="

echo -e "${CYAN}Verificando se o backend está no ar...${NC}"
if ! curl -s --max-time 5 "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${RED}Erro: Backend não está acessível em $BACKEND_URL${NC}"
    echo -e "${YELLOW}Certifique-se de que o container Docker está rodando: docker compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}Backend online.${NC}"
echo -e "${CYAN}Gerando tipos TypeScript a partir de $BACKEND_URL...${NC}"

cd "$(dirname "$0")/Frontend" || exit 1

npx openapi-typescript "$BACKEND_URL" -o "src/types/api.d.ts"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}Tipos gerados com sucesso em $OUTPUT${NC}"
else
    echo -e "${RED}Falha ao gerar os tipos. Verifique os erros acima.${NC}"
    exit 1
fi
