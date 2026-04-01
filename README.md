# Public Admin Propiedad Horizontal

Plataforma web full-stack para la administracion de conjuntos residenciales y propiedad horizontal.

Este proyecto centraliza en una sola aplicacion la gestion de:

- unidades residenciales;
- propietarios y residentes;
- vehiculos y parqueaderos;
- mascotas;
- documentos por apartamento;
- autenticacion y acceso a la plataforma.

La idea principal es reemplazar procesos dispersos en hojas de calculo, archivos sueltos y seguimiento manual por una herramienta operativa mas clara, navegable y escalable.

## Que es este proyecto

Este repositorio contiene una aplicacion en fase beta enfocada en administracion residencial. El sistema ya permite operar el nucleo del dominio: directorio de apartamentos, relacion entre personas y unidades, control de parqueaderos, registro de vehiculos y mascotas, y carga de documentos.

Si alguien llega desde GitHub para evaluar el proyecto, aqui va a encontrar:

- una aplicacion real con frontend y backend separados;
- una base de datos relacional con reglas de integridad del negocio;
- autenticacion con credenciales y Google OAuth;
- una interfaz tipo dashboard orientada a operacion administrativa;
- un entorno local reproducible con Docker;
- un modo demo por defecto para verlo rapido despues de clonar.

## Que puede hacer hoy

### Modulos implementados

- **Apartamentos**
  - listado por torre y estado;
  - vista detalle por unidad;
  - conteos de propietarios, residentes, vehiculos, bicicletas y mascotas;
  - observaciones, tags y autorizaciones;
  - documentos asociados por unidad.

- **Personas**
  - directorio de propietarios y residentes;
  - creacion, edicion y eliminacion;
  - relacion de una persona con una o varias unidades.

- **Vehiculos**
  - directorio general por placa;
  - asignacion a una unidad;
  - relacion con parqueadero privado.

- **Mascotas**
  - censo por unidad;
  - registro, actualizacion y eliminacion.

- **Parqueaderos**
  - inventario de privados y visitantes;
  - validaciones para evitar inconsistencias entre unidad, parqueadero y vehiculo.

- **Autenticacion**
  - registro con correo y contrasena;
  - login con correo y contrasena;
  - login y registro con Google OAuth;
  - JWT en backend y sesion en frontend.

## Stack tecnico

### Frontend

- Next.js 16
- React 19
- TypeScript
- NextAuth
- TanStack Query
- Zustand

### Backend

- Python 3.12
- Django 5
- Django Ninja
- JWT con `django-ninja-jwt`

### Infraestructura

- PostgreSQL 16
- Docker
- Docker Compose
- Makefile para comandos frecuentes

## Arquitectura

El proyecto esta dividido en tres piezas:

1. **Frontend**
   - App Router con Next.js.
   - Dashboard administrativo, login, registro y landing comercial.

2. **Backend**
   - API REST con Django Ninja.
   - Modelos de usuarios, unidades, personas, vehiculos, mascotas, documentos y parqueaderos.

3. **Base de datos**
   - PostgreSQL como almacenamiento principal.

## Como correrlo localmente

La forma recomendada de levantar el proyecto es con Docker.

## Demo local en 2 pasos

El repositorio ahora esta preparado para que puedas clonarlo y verlo sin configurar variables de entorno primero.

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuanDavid-sys/public-propiedad-horizontal.git
cd public-propiedad-horizontal
```

### 2. Encenderlo

```bash
make start-development
```

Luego abre:

- Frontend: `http://localhost:3001`
- API: `http://localhost:8000/api`
- Admin Django: `http://localhost:8000/admin/`

Credenciales demo:

```text
Correo: admin@example.com
Contrasena: admin123
```

Notas:

- Google OAuth es opcional y en la demo local viene desactivado por defecto;
- si `3001` o `8000` ya estan ocupados en tu maquina, libera esos puertos o ajusta los mapeos en `docker/development/docker-compose.yml`.

Con eso ya puedes empezar a recorrer el proyecto.

## Quickstart con Docker

### Que hace el arranque por defecto

Cuando ejecutas `make start-development`, el proyecto:

- levanta PostgreSQL;
- levanta el backend Django;
- ejecuta migraciones automaticamente;
- levanta el frontend Next.js;
- activa el frontend en modo mock para que el dashboard tenga contenido navegable desde el primer arranque.
- mantiene Google OAuth desactivado hasta que configures tus credenciales.

### Comando principal

```bash
make start-development
```

Esto levanta:

- PostgreSQL en `localhost:5432`
- Backend en `localhost:8000`
- Frontend en `localhost:3001`

### Apagar servicios

```bash
make stop-development
```

### Crear datos base reales opcionales

Si despues quieres usar el backend con datos propios y no solo con mocks, puedes crear una estructura vacia de torres, apartamentos y parqueaderos:

```bash
docker exec public_admin_backend python manage.py seed_empty_units
```

### Abrir la aplicacion

- Frontend: `http://localhost:3001`
- API: `http://localhost:8000/api`
- Admin Django: `http://localhost:8000/admin/`

## Como funciona el modo demo

Por defecto, el frontend arranca con mocks activos. Eso significa que:

- puedes entrar de inmediato con la cuenta de prueba;
- puedes recorrer el dashboard sin depender de que ya exista carga real en la base de datos;
- la interfaz muestra el alcance visual y funcional del producto desde el primer minuto.

Al mismo tiempo, el backend **no queda inutil**:

- sigue levantando como parte del stack;
- sigue mostrando que el proyecto es realmente full-stack;
- deja disponible la API;
- deja disponible Django Admin;
- permite pasar despues a datos reales o pruebas mas tecnicas.

En otras palabras: el modo mock mejora la experiencia de evaluacion, pero el backend sigue siendo parte importante de lo que demuestra el proyecto.

## Variables de entorno opcionales

Para el modo demo por defecto, no necesitas crear `.env`.

Solo te haria falta si quieres:

- cambiar secretos locales;
- desactivar mocks;
- habilitar Google OAuth;
- apuntar a otro backend o a otra base de datos.

Para eso ya existen:

- `services/frontend/.env.example`
- `services/backend/.env.example`

## Ejecucion manual sin Docker

Si prefieres correrlo sin contenedores:

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

```bash
cd services/frontend
npm install
npm run dev -- --port 3001
```

En ejecucion manual si te conviene crear:

- `services/backend/.env`
- `services/frontend/.env.local`

tomando como base los archivos `.env.example`.

## Flujo recomendado para evaluar el proyecto

Si alguien entra al repo y quiere entenderlo rapido, este es el mejor recorrido:

1. Levantar el proyecto con Docker.
2. Entrar con la cuenta mock o registrarte.
3. Revisar el directorio de apartamentos.
4. Abrir una unidad y ver personas, vehiculos, mascotas, parqueadero y documentos.
5. Pasar luego por los directorios de personas, vehiculos, mascotas y parqueaderos.

Eso da una vista bastante completa del alcance actual del sistema.

## Estructura del repositorio

```text
.
├── docker/
├── scripts/
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

## Estado actual

El proyecto ya es funcional como base de una plataforma administrativa residencial, pero sigue en evolucion.

### Ya resuelto

- estructura full-stack completa;
- autenticacion;
- modulos operativos principales;
- despliegue local reproducible;
- reglas de integridad entre unidades, parqueaderos y vehiculos.

### Aun en evolucion

- configuracion avanzada;
- parte del modulo de perfil;
- modulos futuros de gestion financiera, comunicacion y reservas.

## Documentacion adicional

Este README esta pensado como portada del proyecto. La documentacion mas especifica vive en:

- `SECURITY.md`
- `NETLIFY_DEPLOY.md`
- `GOOGLE_OAUTH_INTEGRATION.md`

## Licencia

Por definir.
