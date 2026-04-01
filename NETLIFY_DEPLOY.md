# Guía de Deploy en Netlify - Solución de Problemas

Esta guía te ayuda a solucionar los problemas comunes de deploy en Netlify.

---

## Problema: "Unas vistas sí y otras no se actualizan"

### Causas comunes:

1. **Caché del CDN de Netlify**
2. **Incremental Static Regeneration (ISR) de Next.js**
3. **Build incorrecto con caché de node_modules**

### Soluciones:

#### Opción 1: Deploy limpio (recomendado)

```bash
make deploy-frontend-clean
```

Este comando:
- Elimina TODOS los cachés (.next, node_modules/.cache, .netlify/cache)
- Reinstala dependencias limpiamente
- Fuerza un build completamente nuevo

#### Opción 2: Deploy forzado

```bash
make deploy-frontend-force
```

#### Opción 3: Verificar antes de deploy

```bash
cd services/frontend
./scripts/verify-build.sh
make deploy-frontend
```

---

## Configuración de Variables de Entorno en Netlify

### 1. Via Netlify CLI (recomendado para desarrollo)

```bash
cd services/frontend

# Establecer variables
netlify env:set NEXT_PUBLIC_API_URL https://tu-backend.onrender.com/api
netlify env:set AUTH_GOOGLE_ID tu-google-client-id
netlify env:set AUTH_SECRET tu-auth-secret
netlify env:set NEXTAUTH_URL https://tu-app.netlify.app

# Verificar
netlify env:list
```

### 2. Via Dashboard de Netlify

1. Ve a tu sitio en Netlify
2. **Site settings** → **Environment variables**
3. Agrega las variables:
   - `NEXT_PUBLIC_API_URL` → URL de tu backend en Render
   - `AUTH_GOOGLE_ID` → Client ID de Google OAuth
   - `AUTH_SECRET` → Secreto de NextAuth
   - `NEXTAUTH_URL` → URL de tu sitio Netlify
   - `AUTH_GOOGLE_SECRET` → Client Secret de Google

---

## Variables Requeridas en Netlify

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `https://mi-backend.onrender.com/api` |
| `NEXTAUTH_URL` | URL del frontend | `https://mi-app.netlify.app` |
| `AUTH_SECRET` | Secreto para cookies | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | OAuth Client Secret | `GOCSPX-xxx` |

**NOTA**: Las variables que empiezan con `NEXT_PUBLIC_` deben estar disponibles en build time.

---

## Errores Comunes y Soluciones

### Error: "Missing required parameter: client_id"

**Causa**: `AUTH_GOOGLE_ID` no está configurado en Netlify.

**Solución**:
```bash
netlify env:set AUTH_GOOGLE_ID tu-client-id
```

### Error: "Cannot find module '@netlify/plugin-nextjs'"

**Causa**: Falta el plugin de Netlify para Next.js.

**Solución**:
```bash
cd services/frontend
npm install -D @netlify/plugin-nextjs
```

### Error: "Page not found" en rutas dinámicas

**Causa**: Configuración incorrecta de redirects.

**Solución**: Ya está configurado en `netlify.toml` con:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Error: "Invalid hook call" o errores de React

**Causa**: Múltiples versiones de React o caché corrupto.

**Solución**:
```bash
cd services/frontend
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

---

## Configuración del Backend en Render

### CORS Configuración

Asegúrate de que tu backend en Render permita peticiones desde Netlify:

En tu backend (Django settings.py):
```python
CORS_ALLOWED_ORIGINS = [
    "https://tu-app.netlify.app",  # Tu frontend
    "http://localhost:3001",        # Desarrollo local
]
```

### Variables en Render

Configura en Render:
- `ALLOWED_HOSTS` → Incluye tu dominio de Netlify
- `CORS_ALLOWED_ORIGINS` → Tu URL de Netlify

---

## Comandos Útiles

### Ver logs del deploy
```bash
netlify deploy --build --prod --debug
```

### Deploy a preview (sin producción)
```bash
netlify deploy --build
```

### Abrir sitio en browser
```bash
netlify open --site
```

### Ver configuración
```bash
netlify env:list
```

---

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Netlify
- [ ] Backend corriendo en Render y accesible
- [ ] CORS configurado en el backend
- [ ] Google OAuth permite el dominio de Netlify
- [ ] Auth Secret generado y configurado
- [ ] Ejecutar `./scripts/verify-build.sh`
- [ ] Build local exitoso: `npm run build`
- [ ] Deploy con: `make deploy-frontend-clean`

---

## Contacto / Soporte

- [Netlify Docs](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify CLI Reference](https://cli.netlify.com/)
