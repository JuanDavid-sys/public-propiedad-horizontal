# Admin Propiedad Horizontal

Aplicacion web para administrar conjuntos residenciales y procesos de propiedad horizontal desde una interfaz moderna. El proyecto centraliza la gestion de unidades, personas, vehiculos, mascotas, parqueaderos, documentos y autenticacion en un mismo sistema.

Hoy el core funcional implementado esta orientado a operacion residencial y directorio administrativo. La landing comercial muestra ademas un roadmap de modulos futuros como gestion financiera, comunicaciones, reservas y votaciones.

## Tabla de contenido

- [Que resuelve esta aplicacion](#que-resuelve-esta-aplicacion)
- [Funciones principales](#funciones-principales)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Tecnologias usadas](#tecnologias-usadas)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Instalacion desde GitHub](#instalacion-desde-github)
- [Configuracion de variables de entorno](#configuracion-de-variables-de-entorno)
- [Levantamiento con Docker](#levantamiento-con-docker)
- [Levantamiento sin Docker](#levantamiento-sin-docker)
- [Carga inicial de datos](#carga-inicial-de-datos)
- [Como usar la aplicacion](#como-usar-la-aplicacion)
- [Modo mock y demo local](#modo-mock-y-demo-local)
- [Comandos utiles de desarrollo](#comandos-utiles-de-desarrollo)
- [API y modulos del backend](#api-y-modulos-del-backend)
- [Problemas frecuentes](#problemas-frecuentes)
- [Estado actual del proyecto](#estado-actual-del-proyecto)

## Que resuelve esta aplicacion

La aplicacion esta pensada para conjuntos residenciales, copropiedades y equipos administrativos que necesitan dejar atras hojas de calculo dispersas, chats y registros manuales.

Permite:

- mantener un directorio unificado de torres, apartamentos y su estado de ocupacion;
- relacionar propietarios y residentes con cada unidad;
- registrar vehiculos, asignarles parqueadero y consultar ocupacion;
- llevar el censo de mascotas;
- adjuntar documentos por unidad;
- autenticar usuarios con correo/contrasena o Google OAuth;
- exponer una API para consumo del frontend y futuras integraciones.

## Funciones principales

### Modulos actualmente implementados

- **Unidades residenciales**
  - listado por torre y estado;
  - detalle de cada unidad;
  - conteos de propietarios, residentes, vehiculos, bicicletas y mascotas;
  - observaciones, tags y autorizaciones;
  - relacion con parqueadero privado;
  - carga y eliminacion de documentos.

- **Personas**
  - directorio de propietarios y residentes;
  - alta, edicion y eliminacion;
  - relacion de una persona con una o varias unidades;
  - campos administrativos como documento, telefono, correo, autorizacion de datos y observaciones.

- **Vehiculos**
  - listado general por placa;
  - detalle por unidad o por placa global;
  - asignacion y desasignacion de vehiculos a apartamentos;
  - vinculacion con parqueaderos privados;
  - eliminacion de registros.

- **Mascotas**
  - censo general por unidad;
  - alta, edicion y eliminacion;
  - estado de vacunacion y observaciones.

- **Parqueaderos**
  - inventario de parqueaderos privados y de visitantes;
  - relacion entre parqueadero, unidad y vehiculo;
  - validaciones para evitar inconsistencias.

- **Autenticacion**
  - registro con correo y contrasena;
  - login con correo y contrasena;
  - login y registro con Google OAuth;
  - JWT access/refresh tokens;
  - sesiones y auditoria basica en backend.

- **Busqueda**
  - busqueda transversal de unidades, personas, vehiculos, mascotas y parqueaderos desde el dashboard.

### Funciones visibles pero aun no terminadas

- modulo de configuracion;
- parte de personalizacion del perfil;
- roadmap comercial en la landing: gestion financiera, comunicacion, reservas y votacion.

## Arquitectura del proyecto

El proyecto esta dividido en tres capas principales:

1. **Frontend**
   - Aplicacion Next.js 16 con App Router.
   - Usa NextAuth para sesion y autenticacion.
   - Consume el backend Django via server actions, fetch y Axios.

2. **Backend**
   - API en Django 5 + Django Ninja.
   - JWT para autenticacion.
   - Modelos para usuarios, unidades, personas, vehiculos, mascotas, documentos y parqueaderos.

3. **Base de datos**
   - PostgreSQL 16.

## Tecnologias usadas

### Frontend

- Next.js 16
- React 19
- TypeScript
- NextAuth
- TanStack Query
- Axios
- Zustand

### Backend

- Python 3.12
- Django 5
- Django Ninja
- django-ninja-jwt
- PostgreSQL

### Infraestructura local

- Docker
- Docker Compose
- Makefile para automatizar comandos comunes

## Estructura del repositorio

```text
.
├── docker/
│   ├── build/
│   └── development/
├── services/
│   ├── backend/
│   │   ├── config/
│   │   ├── residential/
│   │   └── users/
│   └── frontend/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── public/
├── Makefile
└── README.md
```

## Requisitos previos

Para trabajar en local necesitas una de estas dos rutas:

- **Ruta recomendada:** Docker + Docker Compose.
- **Ruta manual:** Python 3.12, Node.js 20+, npm y PostgreSQL 16.

Tambien vas a necesitar:

- `openssl` para generar secretos;
- una cuenta de Google Cloud solo si vas a habilitar Google OAuth.

## Instalacion desde GitHub

Cuando el proyecto se publique en GitHub, el flujo recomendado para instalarlo sera este:

```bash
git clone https://github.com/tu-organizacion/public-admin-propiedad-horizontal.git
cd public-admin-propiedad-horizontal
```

Luego copia los archivos de entorno base:

```bash
cp services/backend/.env.example services/backend/.env
cp services/frontend/.env.example services/frontend/.env.local
```

Si quieres generar secretos rapidamente, puedes apoyarte en:

```bash
./scripts/generate-secrets.sh
```

Despues edita esos archivos con tus valores reales antes de levantar servicios.

## Configuracion de variables de entorno

### Backend: `services/backend/.env`

Variables minimas para correr el backend:

| Variable | Obligatoria | Ejemplo | Descripcion |
| --- | --- | --- | --- |
| `SECRET_KEY` | Si | `openssl rand -base64 50` | Clave secreta de Django |
| `DEBUG` | Si | `True` | Modo desarrollo |
| `ALLOWED_HOSTS` | Si | `localhost,127.0.0.1,backend` | Hosts permitidos |
| `DATABASE_URL` | Si | `postgresql://admin_user:tu_password@db:5432/admin_db` | Conexion a PostgreSQL |
| `DATABASE_SSL` | No | `False` | SSL para DB |
| `CORS_ALLOWED_ORIGINS` | Si | `http://localhost:3001,http://127.0.0.1:3001` | Origenes permitidos del frontend |
| `POSTGRES_DB` | Recomendado en Docker | `admin_db` | Base usada por el contenedor Postgres |
| `POSTGRES_USER` | Recomendado en Docker | `admin_user` | Usuario de Postgres |
| `POSTGRES_PASSWORD` | Recomendado en Docker | valor seguro | Password de Postgres |

Ejemplo para Docker:

```env
SECRET_KEY=pon_aqui_un_valor_seguro
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend
POSTGRES_DB=admin_db
POSTGRES_USER=admin_user
POSTGRES_PASSWORD=pon_aqui_un_password_seguro
DATABASE_URL=postgresql://admin_user:pon_aqui_un_password_seguro@db:5432/admin_db
DATABASE_SSL=False
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001
```

Ejemplo para ejecucion manual:

```env
SECRET_KEY=pon_aqui_un_valor_seguro
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=admin_db
POSTGRES_USER=admin_user
POSTGRES_PASSWORD=pon_aqui_un_password_seguro
DATABASE_URL=postgresql://admin_user:pon_aqui_un_password_seguro@localhost:5432/admin_db
DATABASE_SSL=False
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001
```

### Frontend: `services/frontend/.env.local`

Variables recomendadas para el frontend:

| Variable | Obligatoria | Ejemplo | Descripcion |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Si | `openssl rand -base64 32` | Secreto de NextAuth |
| `NEXTAUTH_URL` | Si | `http://localhost:3001` | URL publica del frontend |
| `AUTH_GOOGLE_ID` | Depende | valor de Google Cloud | Cliente OAuth |
| `AUTH_GOOGLE_SECRET` | Depende | valor de Google Cloud | Secreto OAuth |
| `NEXT_PUBLIC_API_URL` | Si | `http://localhost:8000/api` | URL del backend vista por el navegador |
| `INTERNAL_API_URL` | Si | `http://backend:8000/api` o `http://localhost:8000/api` | URL del backend usada del lado servidor |
| `NEXT_PUBLIC_USE_MOCKS` | No | `true` | Activa datasets mock en frontend |

Ejemplo para Docker:

```env
AUTH_SECRET=pon_aqui_un_valor_seguro
NEXTAUTH_URL=http://localhost:3001
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:8000/api
INTERNAL_API_URL=http://backend:8000/api
NEXT_PUBLIC_USE_MOCKS=false
```

Ejemplo para ejecucion manual:

```env
AUTH_SECRET=pon_aqui_un_valor_seguro
NEXTAUTH_URL=http://localhost:3001
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:8000/api
INTERNAL_API_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCKS=false
```

### Configuracion de Google OAuth

Si vas a habilitar login con Google, configura el callback:

```text
http://localhost:3001/api/auth/callback/google
```

Si no vas a usar Google en tu primera prueba, deja esas variables listas para despues y usa registro con correo/contrasena.

## Levantamiento con Docker

Esta es la forma mas simple de correr el stack completo.

### 1. Construir contenedores

```bash
make build-development
```

### 2. Iniciar servicios

```bash
make start-development
```

Esto levanta:

- PostgreSQL en `localhost:5432`
- Django en `localhost:8000`
- Next.js en `localhost:3001`

### 3. Ejecutar migraciones

El `docker-compose` actual **no corre migraciones automaticamente**, asi que este paso es obligatorio la primera vez:

```bash
docker exec public_admin_backend python manage.py migrate
```

### 4. Crear un superusuario opcional

Si quieres entrar al admin de Django:

```bash
docker exec -it public_admin_backend python manage.py createsuperuser
```

### 5. Abrir la aplicacion

- Frontend: `http://localhost:3001`
- Backend API base: `http://localhost:8000/api`
- Admin Django: `http://localhost:8000/admin/`

### 6. Apagar servicios

```bash
make stop-development
```

## Levantamiento sin Docker

Si prefieres correr todo directamente en tu maquina:

### Backend

```bash
cd services/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

En otra terminal:

```bash
cd services/frontend
npm install
npm run dev -- --port 3001
```

Abre:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:8000`

## Carga inicial de datos

Tienes varias opciones para preparar datos de prueba.

### Opcion A: crear estructura base vacia

Genera torres, pisos, apartamentos y parqueaderos minimos:

```bash
docker exec public_admin_backend python manage.py seed_empty_units
```

Parametros disponibles:

```bash
docker exec public_admin_backend python manage.py seed_empty_units --towers 10 --floors 16 --apartments-per-floor 4 --visitor-spaces 10
```

### Opcion B: sincronizar solo inventario de parqueaderos

```bash
docker exec public_admin_backend python manage.py sync_parking_inventory --visitor-spaces 10
```

### Opcion C: cargar datos desde JSON

El proyecto tiene un comando:

```bash
docker exec public_admin_backend python manage.py load_residential_data
```

Pero ten presente que **espera archivos JSON en** `services/backend/residential/data_migration/` y esa carpeta no esta incluida hoy en este repositorio. Si quieres usar este flujo, primero debes agregar:

- `people.json`
- `units.json`
- `vehicles.json`

## Como usar la aplicacion

### Flujo recomendado para primera prueba

1. Levanta el stack.
2. Corre migraciones.
3. Crea un usuario desde `/register` o un superusuario en Django.
4. Entra por `/login`.
5. Navega el dashboard desde el menu lateral.

### Rutas principales del frontend

| Ruta | Uso |
| --- | --- |
| `/` | Landing comercial y acceso rapido |
| `/login` | Inicio de sesion |
| `/register` | Registro de usuario |
| `/apartamentos` | Directorio de unidades |
| `/personas` | Directorio de personas |
| `/vehiculos` | Directorio de vehiculos |
| `/mascotas` | Censo de mascotas |
| `/parqueaderos` | Inventario de parqueaderos |
| `/search-results?q=...` | Busqueda global |

### Rutas principales del backend

| Ruta base | Uso |
| --- | --- |
| `/api/auth` | Registro, login, refresh, logout, usuario actual |
| `/api/residential` | Unidades, personas, vehiculos, mascotas, documentos y parqueaderos |
| `/admin/` | Administracion de Django |

### Casos de uso comunes

#### Consultar unidades

- Entra a `/apartamentos`.
- Filtra por torre o estado.
- Abre una fila para ver el detalle completo de la unidad.

#### Registrar una persona

- Entra a `/personas`.
- Crea el registro desde la interfaz.
- Asocia la persona a una unidad desde los flujos de detalle o asignacion.

#### Registrar un vehiculo

- Entra a una unidad o al directorio de vehiculos.
- Crea o asigna el vehiculo.
- Si existe parqueadero privado valido, puedes vincularlo.

#### Registrar una mascota

- Entra a una unidad o al censo de mascotas.
- Agrega la mascota con especie, raza, vacunacion y observaciones.

#### Subir documentos por unidad

- Ve al detalle de una unidad.
- Carga contrato, certificado u otro tipo de documento.
- El backend guarda el archivo en `services/backend/media/unit_documents/`.

## Modo mock y demo local

El frontend soporta un modo mock a traves de:

```env
NEXT_PUBLIC_USE_MOCKS=true
```

Cuando activas ese flag:

- varias pantallas usan datos simulados en lugar de consultar el backend real;
- el login mock del frontend resulta util para recorrer la interfaz;
- algunas ediciones de demo se persisten de forma temporal en disco.

### Credenciales mock de desarrollo

```text
Correo: admin@example.com
Contrasena: admin123
```

Importante:

- estas credenciales mock tienen sentido sobre todo en **modo mock**;
- si el frontend esta apuntando al backend real y no usas mocks, lo recomendable es registrarte con `/register` o crear un usuario real en Django.

## Comandos utiles de desarrollo

### Makefile

```bash
make build-development
make start-development
make stop-development
```

### Backend

```bash
cd services/backend
python manage.py migrate
python manage.py createsuperuser
python manage.py test
```

### Frontend

```bash
cd services/frontend
npm install
npm run dev -- --port 3001
npm run lint
npm run build
```

## API y modulos del backend

### Autenticacion

Principales endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-auth`
- `POST /api/auth/google-register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Gestion residencial

Principales endpoints:

- `GET /api/residential/units`
- `GET /api/residential/units/{tower}/{unit_number}`
- `PATCH /api/residential/units/{tower}/{unit_number}`
- `GET /api/residential/people`
- `POST /api/residential/people`
- `PATCH /api/residential/people/{document_number}`
- `DELETE /api/residential/people/{document_number}`
- `GET /api/residential/vehicles`
- `GET /api/residential/vehicles/{plate}`
- `POST /api/residential/units/{tower}/{unit_number}/assign-vehicle`
- `GET /api/residential/pets`
- `POST /api/residential/units/{tower}/{unit_number}/assign-pet`
- `GET /api/residential/parking`
- `POST /api/residential/units/{tower}/{unit_number}/documents`

## Problemas frecuentes

### La aplicacion abre pero no muestra datos

Revisa:

- que corriste `python manage.py migrate`;
- que la base de datos tenga registros;
- que `NEXT_PUBLIC_USE_MOCKS` no este en un valor distinto al esperado;
- que `INTERNAL_API_URL` y `NEXT_PUBLIC_API_URL` apunten correctamente al backend.

### El frontend en Docker no logra hablar con el backend

Dentro de Docker, `INTERNAL_API_URL` debe usar el nombre del servicio:

```env
INTERNAL_API_URL=http://backend:8000/api
```

### El login con Google falla

Verifica:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `NEXTAUTH_URL`
- callback OAuth configurado como `http://localhost:3001/api/auth/callback/google`

### El login mock entra, pero luego la app no funciona bien contra el backend

Eso suele pasar cuando usas credenciales mock sin activar:

```env
NEXT_PUBLIC_USE_MOCKS=true
```

Para trabajar contra backend real, usa usuarios reales.

### El comando `load_residential_data` falla

Ese comando requiere archivos JSON que hoy no vienen incluidos en el repo. Usa `seed_empty_units` mientras preparas esos datos.

## Estado actual del proyecto

El proyecto esta en una fase funcional de beta. Ya permite operar el nucleo de administracion residencial, pero todavia hay modulos visuales o comerciales en evolucion.

Si vas a publicarlo en GitHub, este README ya queda listo como base para:

- onboarding tecnico;
- instalacion local;
- despliegues iniciales;
- documentacion funcional del producto.
