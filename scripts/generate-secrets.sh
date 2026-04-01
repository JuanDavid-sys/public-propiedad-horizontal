#!/bin/bash

# Script para generar credenciales seguras para el proyecto
# Ejecutar: ./scripts/generate-secrets.sh

set -e

echo "=============================================="
echo "Generador de Credenciales Seguras"
echo "=============================================="
echo ""

# Crear directorio para secrets si no existe
mkdir -p services/frontend
mkdir -p services/backend

echo "1. Generando AUTH_SECRET (NextAuth)..."
AUTH_SECRET=$(openssl rand -base64 32)
echo "   AUTH_SECRET=$AUTH_SECRET"
echo ""

echo "2. Generando DJANGO_SECRET_KEY..."
DJANGO_SECRET_KEY=$(openssl rand -base64 50)
echo "   DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY"
echo ""

echo "3. Generando PostgreSQL Password..."
POSTGRES_PASSWORD=$(openssl rand -base64 20)
echo "   POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

echo "=============================================="
echo "Variables de Entorno Generadas"
echo "=============================================="
echo ""
echo "Copia estas variables en tus archivos .env:"
echo ""
echo "--- services/frontend/.env.local ---"
echo "AUTH_SECRET=$AUTH_SECRET"
echo "NEXTAUTH_URL=http://localhost:3001"
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api"
echo "INTERNAL_API_URL=http://backend:8000/api"
echo ""
echo "# Agrega tus credenciales de Google aquí:"
echo "AUTH_GOOGLE_ID=tu_nuevo_client_id.apps.googleusercontent.com"
echo "AUTH_GOOGLE_SECRET=tu_nuevo_client_secret"
echo ""
echo "--- services/backend/.env ---"
echo "SECRET_KEY=$DJANGO_SECRET_KEY"
echo "DEBUG=True"
echo "ALLOWED_HOSTS=localhost,127.0.0.1,backend"
echo "DATABASE_URL=postgresql://admin_user:${POSTGRES_PASSWORD}@db:5432/admin_db"
echo "DATABASE_SSL=False"
echo "CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001"
echo ""
echo "=============================================="
echo "IMPORTANTE:"
echo "=============================================="
echo "1. Guarda estas credenciales en un lugar seguro"
echo "2. NUNCA commitees los archivos .env o .env.local"
echo "3. Rota las credenciales de Google Cloud (ver SECURITY.md)"
echo "4. Reinicia los contenedores después de actualizar los .env"
echo ""
echo "Para reiniciar: make stop-development && make start-development"
echo "=============================================="
