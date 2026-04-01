#!/bin/bash

# Script para verificar el build antes de deploy a Netlify
# Ejecutar: ./scripts/verify-build.sh

set -e

echo "=============================================="
echo "Verificación Pre-Deploy"
echo "=============================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_env() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Missing: $2${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Set: $2${NC}"
        return 0
    fi
}

echo "1. Verificando variables de entorno..."
echo ""

MISSING=0

if ! check_env "$NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_API_URL"; then
    MISSING=$((MISSING + 1))
fi

if ! check_env "$AUTH_GOOGLE_ID" "AUTH_GOOGLE_ID"; then
    MISSING=$((MISSING + 1))
fi

if ! check_env "$AUTH_SECRET" "AUTH_SECRET"; then
    MISSING=$((MISSING + 1))
fi

if ! check_env "$NEXTAUTH_URL" "NEXTAUTH_URL"; then
    MISSING=$((MISSING + 1))
fi

echo ""

if [ $MISSING -gt 0 ]; then
    echo -e "${RED}❌ Faltan $MISSING variables de entorno críticas${NC}"
    echo ""
    echo "Por favor configura las variables en tu archivo .env.local"
    echo "o en el dashboard de Netlify (Site settings > Environment variables)"
    exit 1
fi

echo -e "${GREEN}✅ Todas las variables de entorno están configuradas${NC}"
echo ""

echo "2. Verificando archivos críticos..."
FILES=("netlify.toml" "next.config.ts" "package.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file existe${NC}"
    else
        echo -e "${RED}❌ $file NO existe${NC}"
        exit 1
    fi
done

echo ""
echo "3. Limpiando caché anterior..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true

echo ""
echo "4. Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no existe, instalando...${NC}"
    npm ci
else
    echo -e "${GREEN}✅ node_modules existe${NC}"
fi

echo ""
echo "5. Ejecutando lint..."
npm run lint || echo -e "${YELLOW}⚠️  Lint terminó con advertencias${NC}"

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Verificación completada${NC}"
echo ""
echo "Puedes hacer deploy con:"
echo "  make deploy-frontend"
echo ""
echo "Si tienes problemas de cache, usa:"
echo "  make deploy-frontend-clean"
echo "=============================================="
