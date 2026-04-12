# Light Solution — Sistema de Gestión de Servicio Técnico

Sistema interno para gestión de órdenes de trabajo en taller de escenografía técnica (parleds, cabezas móviles, barras LED, FX).

## Stack

**Backend:** Node.js · Express · PostgreSQL · JWT  
**Frontend:** React · Vite · React Router · Axios

## Funcionalidades

- Ingreso de equipos con número autogenerado (`ST-2026-0001`)
- Estados: por reparar → en reparación → reparado → entregado / irreparable
- Historial de cambios con usuario y timestamp
- Buscador global por cliente, equipo y N° de ingreso
- Panel de equipos listos para entregar con teléfono clickeable
- Orden de trabajo imprimible / exportable a PDF
- Gestión de usuarios con roles (técnico / recepcionista)
- Autenticación JWT con expiración de sesión

## Estructura

```
├── servicio-tecnico-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── db/
│   └── .env.example
└── servicio-tecnico-frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── context/
        └── hooks/
```

## Instalación local

### Backend
```bash
cd servicio-tecnico-backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL
npm run dev
```

### Frontend
```bash
cd servicio-tecnico-frontend
npm install
npm run dev
```

### Base de datos
Ejecuta el script SQL en `/servicio-tecnico-backend/db/schema.sql` en tu instancia de PostgreSQL.

## Variables de entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=servicio_tecnico
JWT_SECRET=
JWT_EXPIRES_IN=8h
```