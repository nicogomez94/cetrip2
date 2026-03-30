# CETRIP – Centro de Rehabilitación Infantil

Sitio web autoadministrable para CETRIP, desarrollado con React, Node.js, Express y PostgreSQL.

---

## Requisitos previos

- **Node.js** v18 o superior
- **PostgreSQL** instalado y corriendo
- **npm** v9 o superior

---

## Estructura del proyecto

```
cetrip2/
├── backend/              # API REST con Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/          # Imágenes subidas
│   ├── .env
│   └── server.js
├── frontend/             # SPA con React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── .env
└── README.md
```

---

## Instalación paso a paso

### 1. Clonar o descargar el proyecto

```bash
cd /ruta/donde/quieras/instalar
```

### 2. Crear la base de datos en PostgreSQL

```bash
psql -U postgres -c "CREATE DATABASE cetrip;"
```

### 3. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Verificar el archivo `.env` (ya viene preconfigurado para desarrollo):

```
DATABASE_URL="postgresql://postgres:root@localhost:5432/cetrip?schema=public"
JWT_SECRET=cetrip_jwt_secret_super_seguro_cambiar_en_produccion
PORT=4000
UPLOADS_DIR=./uploads
```

### 4. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 5. Generar el cliente Prisma y migrar la base de datos

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Poblar la base de datos con datos iniciales (seed)

```bash
cd backend
node prisma/seed.js
```

### 7. Configurar el frontend

```bash
cd ../frontend
cp .env.example .env
```

### 8. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

---

## Ejecución

### Levantar el backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en: `http://localhost:4000`

### Levantar el frontend

Abrir otra terminal:

```bash
cd frontend
npm run dev
```

El sitio estará disponible en: `http://localhost:5173`

---

## Acceso al panel de administración

```
URL:       http://localhost:5173/admin/login
Email:     admin@cetrip.com
Contraseña: admin123
```

---

## Modo Debug

Para activar el autocompletado de formularios en testing:

**Backend** (`backend/.env`):
```
DEBUG=true
```

**Frontend** (`frontend/.env`):
```
VITE_DEBUG=true
```

Con `VITE_DEBUG=true`, los formularios de contacto y login se autocompletarán con datos de prueba.

---

## Producción: imágenes con Cloudinary

El endpoint `/api/admin/upload` usa Cloudinary cuando detecta estas variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (opcional, por defecto `cetrip`)

Si Cloudinary no está configurado, el backend usa fallback local con `UPLOADS_DIR`.

Además, cuando un bloque reemplaza su `imageUrl` o se elimina un bloque/sección, el backend intenta borrar la imagen vieja automáticamente si ya no está referenciada por ningún otro bloque.

---

## Comandos útiles

### Base de datos

```bash
# Crear migración nueva
cd backend && npx prisma migrate dev --name nombre_migracion

# Resetear y re-seedear la DB
cd backend && npx prisma migrate reset --force && node prisma/seed.js

# Abrir Prisma Studio (interfaz visual de la DB)
cd backend && npx prisma studio

# Regenerar cliente Prisma (después de cambiar schema.prisma)
cd backend && npx prisma generate
```

### Backend

```bash
# Modo desarrollo (hot-reload)
cd backend && npm run dev

# Modo producción
cd backend && npm start
```

### Frontend

```bash
# Modo desarrollo
cd frontend && npm run dev

# Build para producción
cd frontend && npm run build

# Preview del build
cd frontend && npm run preview
```

---

## API Reference

### Rutas públicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/public/sections/:page` | Secciones activas de una página |
| POST | `/api/public/contact` | Enviar mensaje de contacto |
| GET | `/api/health` | Health check del servidor |

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Datos del usuario autenticado |
| PUT | `/api/auth/change-password` | Cambiar contraseña |

### Admin – Secciones (requiere token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/sections` | Listar secciones |
| POST | `/api/admin/sections` | Crear sección |
| PUT | `/api/admin/sections/:id` | Editar sección |
| PATCH | `/api/admin/sections/:id/toggle` | Activar/desactivar |
| DELETE | `/api/admin/sections/:id` | Eliminar sección |

### Admin – Bloques (requiere token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/blocks` | Listar bloques |
| POST | `/api/admin/blocks` | Crear bloque |
| PUT | `/api/admin/blocks/:id` | Editar bloque |
| PATCH | `/api/admin/blocks/:id/toggle` | Activar/desactivar |
| DELETE | `/api/admin/blocks/:id` | Eliminar bloque |

### Admin – Mensajes (requiere token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/messages` | Listar mensajes |
| PATCH | `/api/admin/messages/:id/read` | Marcar como leído |
| DELETE | `/api/admin/messages/:id` | Eliminar mensaje |

### Admin – Uploads (requiere token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/upload` | Subir imagen (form-data, campo: `image`) |

---

## Tipos de bloques disponibles

| Tipo | Descripción |
|------|-------------|
| `HERO` | Bloque principal con imagen de fondo, título, subtítulo y CTA |
| `TEXT` | Bloque de texto con título y contenido |
| `IMAGE` | Imagen con caption opcional |
| `VIDEO` | Embed de video (URL de YouTube/Vimeo embed) |
| `CARD` | Tarjeta con imagen, título y texto |
| `CTA` | Call to action con texto y botón |

---

## Páginas disponibles

| Slug | Descripción |
|------|-------------|
| `home` | Página de inicio |
| `quienes-somos` | Quiénes somos |
| `admision` | Proceso de admisión |
| `servicios` | Servicios ofrecidos |
| `contacto` | Contacto |

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:root@localhost:5432/cetrip?schema=public` |
| `JWT_SECRET` | Secreto para JWT | `clave_segura_larga` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5173` |
| `BACKEND_URL` | URL base del backend | `http://localhost:4000` |
| `UPLOADS_DIR` | Ruta local de uploads (fallback sin Cloudinary) | `./uploads` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | `mi-cloud` |
| `CLOUDINARY_API_KEY` | API key de Cloudinary | `1234567890` |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary | `xxxxxxxx` |
| `CLOUDINARY_FOLDER` | Carpeta destino en Cloudinary | `cetrip` |
| `DEBUG` | Modo debug | `false` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL de la API | `http://localhost:4000/api` |
| `VITE_DEBUG` | Modo debug | `false` |

---

## Notas de seguridad

- Cambiar `JWT_SECRET` por un secreto seguro en producción.
- Configurar HTTPS en producción.
- Cambiar las credenciales del admin desde el panel después del primer login.
- El directorio `uploads/` no debe exponerse sin control en producción.
