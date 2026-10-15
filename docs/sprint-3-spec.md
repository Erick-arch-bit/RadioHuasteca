# Sprint 3 · Trámites, audio y acceso administrativo

La aplicación web mantiene React + Vite + Tailwind. El servidor Express y PostgreSQL se incorporan como capa aditiva; los avisos, cápsulas, navegación y boletín de Sprints 1–2 conservan su implementación.

## Diagrama de datos

```mermaid
erDiagram
  PROCEDURES ||--o| PROCEDURE_AUDIOS : "puede tener"
  PROCEDURES {
    text id PK
    text title UK
    text summary
    jsonb requirements
    jsonb steps
    text responsible
    text validity
    boolean priority
    jsonb translations
  }
  PROCEDURE_AUDIOS {
    bigint id PK
    text procedure_id FK_UK
    text url
    text language
    boolean is_demo
  }
  ADMIN_USERS {
    bigint id PK
    text username UK
    text email UK
    text display_name
    text password_hash
  }
```

`procedure_audios.procedure_id` tiene FK con `ON DELETE CASCADE` y es único. Requisitos y pasos son arreglos JSON no vacíos. Campos requeridos tienen restricciones `NOT NULL`; los identificadores, títulos, usuarios y correos únicos evitan duplicados. Las contraseñas se almacenan con hash bcrypt por `pgcrypto`; la API nunca devuelve el hash.

## Puesta en marcha

1. Copia `.env.example` a `.env`; define `DATABASE_URL` y un `SESSION_SECRET` aleatorio de al menos 32 caracteres. Exporta estas variables en la terminal; no publiques `.env`.
2. Ejecuta `npm run db:init` para crear las tablas y cargar tres trámites demostrativos y sus audios relacionados.
3. Define temporalmente `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD` (mínimo 12 caracteres) y ejecuta `npm run admin:create`. No hay credenciales predeterminadas en el repositorio.
4. Ejecuta `npm run server` y, en otra terminal, `npm run dev`. Vite reenvía `/api` a Express.

En producción, sirve interfaz y API bajo el mismo origen HTTPS. La cookie de sesión es `HttpOnly`, `SameSite=Strict` y `Secure` en producción.

## API

- `GET /api/health`, `GET /api/procedures`
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/admin/summary` requiere una sesión válida

## Alcance y datos de demostración

El listado funciona inmediatamente con sus datos semilla locales, sin PostgreSQL. Dos trámites prioritarios tienen audio ligado por identificador y usan archivos de `public/audio`; son muestras reutilizadas del boletín, no grabaciones definitivas de los trámites. Las referencias y requisitos son ilustrativos y deben confirmarse con las autoridades antes de publicarse como información oficial.

La estructura Hñähñu queda marcada como pendiente de traducción y validación; no se presentan traducciones nuevas como definitivas. El panel autenticado muestra un resumen del catálogo y permite cerrar sesión. El panel todavía no permite CRUD de trámites ni subir audios.

## Capturas y verificaci?n reproducible

Con PostgreSQL iniciado y las variables locales de `.env` configuradas, arranca `npm run server` y `npm run dev` en terminales separadas. Despu?s ejecuta `npm run verify:sprint3`. El flujo usa Chrome headless y guarda capturas PNG, el diagrama vectorial SVG y el informe en `docs/evidence/sprint-3/`. El script cubre cat?logo y detalle en 320/390 px, audio asociado y no disponible, regreso al cat?logo, login vac?o/inv?lido/v?lido, panel y cierre de sesi?n.
