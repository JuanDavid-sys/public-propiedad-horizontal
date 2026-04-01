# Guía de Seguridad - Rotación de Credenciales

> ⚠️ **URGENTE**: Las credenciales anteriores han sido expuestas en el repositorio. Debes rotarlas inmediatamente siguiendo esta guía.

---

## 1. Revocar Credenciales de Google Cloud

### 1.1 OAuth 2.0 Client ID (Autenticación de usuarios)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: `89612992877` (o el que corresponda)
3. Navega a: **APIs & Services** → **Credentials**
4. Busca el cliente OAuth: `89612992877-5vl28hm85oqf8vta0dsiad0jt4dgptls.apps.googleusercontent.com`
5. Haz clic en el cliente
6. Presiona **DELETE** para eliminarlo permanentemente
7. Crea un nuevo cliente OAuth:
   - **Application type**: Web application
   - **Name**: Admin Propiedad Horizontal OAuth
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/api/auth/callback/google`
   - (Agrega también las URLs de producción cuando las tengas)

### 1.2 Service Account (Google Sheets)

1. En **Credentials**, busca el Service Account: `sheets-connector@residential-management-485923.iam.gserviceaccount.com`
2. Ve a **IAM & Admin** → **Service Accounts**
3. Selecciona el Service Account
4. Ve a la pestaña **Keys**
5. Elimina todas las keys existentes (revocarlas)
6. Crea una nueva key:
   - **Key type**: JSON
   - Descarga el archivo JSON (se descargará automáticamente)
   - **IMPORTANTE**: Guarda este archivo en un lugar seguro, no lo subas al repo

### 1.3 Hojas de Cálculo (Google Sheets)

Si compartiste la hoja de cálculo con el service account anterior:
1. Ve a tu Google Sheet
2. Ve a **Compartir**
3. Elimina el acceso del service account anterior
4. Agrega el nuevo service account con permisos de **Editor**

---

## 2. Generar Nuevas Credenciales Locales

### 2.1 AUTH_SECRET (NextAuth)

```bash
# Genera una clave segura de 32 bytes en base64
openssl rand -base64 32

# Ejemplo de salida:
# abc123xyz789...(64 caracteres)
```

### 2.2 DJANGO_SECRET_KEY

```bash
# Genera una clave segura de 50 bytes en base64
openssl rand -base64 50

# Ejemplo de salida:
# xyz789abc456...(más de 60 caracteres)
```

### 2.3 PostgreSQL Password (Desarrollo Local)

```bash
# Genera una contraseña segura de 20 caracteres
openssl rand -base64 20

# Ejemplo de salida:
# abc123XYZ789!@#$%
```

---

## 3. Configurar Variables de Entorno

### 3.1 Frontend (.env.local)

Copia el archivo de ejemplo y rellena con tus nuevas credenciales:

```bash
cd services/frontend
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
AUTH_SECRET=valor_generado_con_openssl
NEXTAUTH_URL=http://localhost:3001

AUTH_GOOGLE_ID=nuevo_client_id_de_google.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=nuevo_client_secret_de_google

NEXT_PUBLIC_API_URL=http://localhost:8000/api
INTERNAL_API_URL=http://backend:8000/api

GOOGLE_SHEET_ID=1zq5yJP8tfDasuhc-PoyOR9fJKYZBaT9cIQAGMzbyPFg
GOOGLE_SERVICE_ACCOUNT_EMAIL=nuevo_service_account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="tu_private_key_escapada_aqui"
```

**Nota**: El `GOOGLE_PRIVATE_KEY` debe tener los saltos de línea escapados como `\n`.

### 3.2 Backend (.env)

```bash
cd services/backend
cp .env.example .env
```

Edita `.env` con tus valores reales:

```env
SECRET_KEY=valor_generado_con_openssl_para_django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

DATABASE_URL=postgresql://admin_user:tu_nueva_password@db:5432/admin_db
DATABASE_SSL=False

CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001
```

---

## 4. Verificar la Configuración

### 4.1 Verificar que .env.local está ignorado

```bash
# Desde la raíz del proyecto
git check-ignore services/frontend/.env.local
# Debe responder: services/frontend/.env.local
```

### 4.2 Verificar que .env está ignorado

```bash
git check-ignore services/backend/.env
# Debe responder: services/backend/.env
```

### 4.3 Iniciar los servicios

```bash
# Desde la raíz del proyecto
make start-development
# o manualmente:
docker-compose -f docker/development/docker-compose.yml up -d
```

---

## 5. Limpieza del Historial de Git (Opcional pero Recomendado)

Si las credenciales estaban en el historial de git, debes eliminarlas:

```bash
# ⚠️ ADVERTENCIA: Esto reescribe el historial de git
# Solo ejecutar si las credenciales estaban commiteadas

# Instalar git-filter-repo (si no lo tienes)
# pip install git-filter-repo

# Eliminar el archivo del historial
git filter-repo --path services/frontend/.env.local --invert-paths

# O si quieres limpiar archivos específicos de múltiples commits
git filter-repo --replace-text <(echo 'tu_client_secret_comprometido==>REDACTED')
```

**Alternativa más segura**: Si el repo es privado y tiene poco historial, considera crear un nuevo repo y migrar el código sin las credenciales.

---

## 6. Checklist de Seguridad

- [ ] OAuth Client ID de Google eliminado
- [ ] OAuth Client Secret de Google eliminado
- [ ] Service Account Key de Google eliminada
- [ ] Nueva OAuth Client ID creada
- [ ] Nueva Service Account Key creada
- [ ] AUTH_SECRET generado nuevo
- [ ] DJANGO_SECRET_KEY generado nuevo
- [ ] Password de PostgreSQL cambiada
- [ ] `.env.local` creado y configurado (no commiteado)
- [ ] `.env` creado y configurado (no commiteado)
- [ ] `.gitignore` actualizado
- [ ] Aplicación probada y funcionando
- [ ] Historial de git limpiado (si aplica)

---

## 7. Protección Futura

### Pre-commit Hooks

Instala pre-commit hooks para evitar que se suban credenciales accidentalmente:

```bash
# Instalar pre-commit
pip install pre-commit

# Crear archivo .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
      - id: check-merge-conflict
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
EOF

# Instalar los hooks
pre-commit install
```

### GitGuardian o Similar

Considera usar GitGuardian o similar para monitorear el repo:
- [GitGuardian](https://www.gitguardian.com/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

## Contacto de Emergencia

Si necesitas ayuda urgente con la rotación de credenciales:
1. Google Cloud Support (si tienes plan pagado)
2. Revoca el OAuth Client ID inmediatamente desde la consola
3. Desactiva el Service Account mientras resuelves

---

**Última actualización**: 2026-03-26
**Responsable de seguridad**: [Tu nombre/equipo]
