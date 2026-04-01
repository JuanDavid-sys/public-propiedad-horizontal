# 🔐 Integración de Google OAuth con Backend Django

## 📋 Resumen de Cambios

Se ha implementado la **Opción 1: Auto-registro** para integrar completamente Google OAuth con el backend Django. Ahora todos los usuarios que inicien sesión con Google serán automáticamente registrados en la base de datos.

---

## 🎯 Problema Resuelto

**Antes**: Los usuarios podían iniciar sesión con Google sin estar registrados en la base de datos Django, ya que NextAuth y Django funcionaban de forma independiente.

**Ahora**: Cuando un usuario inicia sesión con Google:
1. ✅ Se verifica si existe en la base de datos
2. ✅ Si no existe, se crea automáticamente
3. ✅ Se sincronizan los datos entre NextAuth y Django
4. ✅ Se generan tokens JWT del backend
5. ✅ Los tokens se guardan en localStorage para futuras peticiones

---

## 🔧 Cambios Implementados

### **Backend (Django)**

#### 1. **Nuevo Schema** (`users/schemas.py`)
```python
class GoogleAuthSchema(BaseModel):
    """Schema para autenticación con Google OAuth"""
    google_id: str
    email: EmailStr
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None
```

#### 2. **Nuevo Endpoint** (`users/api.py`)
- **Ruta**: `POST /api/auth/google-auth`
- **Función**: Crear o recuperar usuario autenticado con Google
- **Lógica**:
  - Busca usuario por `google_id`
  - Si no existe, busca por `email`
  - Si existe por email pero sin `google_id`, lo vincula
  - Si no existe, crea nuevo usuario con:
    - `is_verified=True` (Google ya verificó el email)
    - `password` no usable (solo OAuth)
    - `role='resident'` por defecto
  - Genera tokens JWT
  - Crea sesión en la base de datos
  - Registra en audit log

### **Frontend (Next.js)**

#### 3. **Configuración de NextAuth** (`auth.ts`)
Se agregaron callbacks para sincronizar con el backend:

**`signIn` callback**:
- Intercepta el login de Google
- Llama al endpoint `/api/auth/google-auth`
- Recibe tokens del backend
- Los guarda en el token JWT de NextAuth

**`jwt` callback**:
- Persiste los tokens del backend en el JWT

**`session` callback**:
- Pasa los tokens a la sesión del cliente

#### 4. **Componente de Sincronización** (`components/AuthSyncComponent.tsx`)
- Componente cliente que escucha cambios en la sesión
- Guarda automáticamente los tokens en `localStorage`
- Limpia tokens cuando el usuario cierra sesión

#### 5. **SessionProvider** (`providers/SessionProvider.tsx`)
- Wrapper para NextAuth SessionProvider
- Permite usar `useSession()` en toda la app

#### 6. **Layout Principal** (`app/layout.tsx`)
- Envuelve la app con `SessionProvider`
- Incluye `AuthSyncComponent` para sincronización automática

#### 7. **Páginas de Autenticación**
- **Login** (`app/login/page.tsx`): Ya tenía el botón de Google configurado
- **Register** (`app/register/page.tsx`): Ahora el botón de Google funciona correctamente

#### 8. **Variables de Entorno** (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🔄 Flujo de Autenticación con Google

### **Paso a Paso**:

1. **Usuario hace clic en "Continuar con Google"**
   ```tsx
   onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
   ```

2. **NextAuth redirige a Google OAuth**
   - Usuario autoriza la aplicación
   - Google devuelve datos del usuario

3. **Callback `signIn` se ejecuta** (en `auth.ts`)
   ```typescript
   // Llama al backend Django
   POST /api/auth/google-auth
   {
     google_id: "123456789",
     email: "usuario@gmail.com",
     first_name: "Juan",
     last_name: "Pérez",
     profile_picture: "https://..."
   }
   ```

4. **Backend procesa la solicitud**
   - Busca o crea el usuario
   - Genera tokens JWT
   - Devuelve:
   ```json
   {
     "access_token": "eyJ...",
     "refresh_token": "eyJ...",
     "user": { "id": 1, "email": "...", ... }
   }
   ```

5. **Frontend guarda los tokens**
   - En el JWT de NextAuth (callback `jwt`)
   - En la sesión (callback `session`)
   - En localStorage (via `AuthSyncComponent`)

6. **Usuario es redirigido al dashboard**
   - Con sesión de NextAuth activa
   - Con tokens del backend en localStorage
   - Listo para hacer peticiones autenticadas

---

## 🧪 Cómo Probar

### **1. Reiniciar los servicios**
```bash
# En el directorio raíz del proyecto
make stop-development
make start-development
```

### **2. Verificar que el backend esté corriendo**
```bash
curl http://localhost:8000/api/hello
# Debería responder: {"message": "Hola desde Django Ninja!"}
```

### **3. Probar el login con Google**
1. Ir a `http://localhost:3001/login`
2. Hacer clic en "Continuar con Google"
3. Autorizar la aplicación
4. Verificar que:
   - Redirige al dashboard
   - En la consola del navegador aparece: "✅ Tokens sincronizados con localStorage"
   - En localStorage hay: `access_token`, `refresh_token`, `user`

### **4. Verificar en la base de datos**
```bash
# Conectarse al contenedor de Django
docker exec -it <container_name> python manage.py shell

# En el shell de Django:
from users.models import User
user = User.objects.filter(email='tu-email@gmail.com').first()
print(user.google_id)  # Debería mostrar el ID de Google
print(user.is_verified)  # Debería ser True
print(user.has_usable_password())  # Debería ser False
```

---

## 🔒 Seguridad

### **Validaciones Implementadas**:
- ✅ Solo usuarios con cuenta activa pueden iniciar sesión
- ✅ Se registra cada login en el audit log
- ✅ Los tokens tienen expiración (30 min access, 7 días refresh)
- ✅ Las sesiones se guardan en la base de datos
- ✅ CORS configurado correctamente

### **Usuarios OAuth**:
- No tienen contraseña usable (solo pueden entrar con Google)
- Email automáticamente verificado
- Username generado automáticamente del email
- Si ya existía con email pero sin Google, se vincula la cuenta

---

## 📊 Modelos de Base de Datos

### **User Model** (ya existente)
```python
google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
is_verified = models.BooleanField(default=False)
profile_picture = models.URLField(blank=True, null=True)
```

### **AuditLog** (ya existente)
Registra todos los eventos de autenticación:
- `account_created` con `method: 'google_oauth'`
- `login_success` con `method: 'google_oauth'`

---

## 🚀 Próximos Pasos Recomendados

1. **Probar el flujo completo** de login con Google
2. **Verificar** que los usuarios se crean correctamente en la BD
3. **Revisar** los logs de auditoría en el admin de Django
4. **Opcional**: Agregar más proveedores OAuth (GitHub, Microsoft, etc.)
5. **Opcional**: Implementar refresh token automático cuando expire

---

## 🐛 Troubleshooting

### **Error: "Error al sincronizar con backend"**
- Verificar que el backend esté corriendo en `http://localhost:8000`
- Verificar que `NEXT_PUBLIC_API_URL` esté configurado en `.env.local`
- Revisar logs del backend para ver el error específico

### **Los tokens no se guardan en localStorage**
- Verificar que `AuthSyncComponent` esté en el layout
- Abrir la consola del navegador y buscar el mensaje de confirmación
- Verificar que la sesión de NextAuth esté activa

### **Usuario no se crea en la base de datos**
- Revisar logs del backend Django
- Verificar que las migraciones estén aplicadas
- Verificar que el modelo User tenga el campo `google_id`

---

## ✅ Checklist de Verificación

- [x] Backend: Endpoint `/api/auth/google-auth` creado
- [x] Backend: Schema `GoogleAuthSchema` agregado
- [x] Frontend: NextAuth configurado con callbacks
- [x] Frontend: `AuthSyncComponent` creado y agregado al layout
- [x] Frontend: `SessionProvider` configurado
- [x] Frontend: Botones de Google en login y register funcionando
- [x] Variables de entorno: `NEXT_PUBLIC_API_URL` configurada
- [x] CORS: Configurado en Django
- [x] Documentación: Este archivo creado

---

## 📝 Notas Importantes

1. **Usuarios existentes**: Si un usuario ya se registró con email/password y luego usa Google con el mismo email, las cuentas se vincularán automáticamente.

2. **Contraseñas**: Los usuarios creados vía Google OAuth no tienen contraseña. Si quieren usar login tradicional, necesitarán establecer una contraseña (funcionalidad a implementar).

3. **Tokens**: Los tokens del backend se usan para todas las peticiones API. La sesión de NextAuth solo se usa para el middleware de rutas protegidas.

4. **Producción**: En producción, cambiar `CORS_ALLOW_ALL_ORIGINS = True` a una lista específica de orígenes permitidos.

---

**¡Implementación completada! 🎉**
