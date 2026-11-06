# RadioHuasteca API

Backend independiente de la interfaz. Ejecuta `bun install`, copia `.env.example` a `.env`, configura PostgreSQL y las credenciales de Cloudinary, luego usa `bun run db:init`, `bun run admin:create` y `bun run dev`.

La API completa usa Bun + Elysia y el driver `postgres` para autenticación, catálogo, avisos, fonoteca y moderación. Cloudinary almacena fotos, audios y videos; `POST /api/media/upload` recibe `FormData` nativo de Bun y devuelve `url`, `publicId` y `resourceType`. Las imágenes se entregan con `f_auto,q_auto,c_limit,w_400` para reducir datos en conexiones lentas.

El servidor de producción se inicia con `bun run src/index.ts`. La inicialización usa `bun run db:init` y la cuenta administrativa `bun run admin:create`. Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` solo en el entorno del servidor. Nunca uses estas credenciales en variables `VITE_*`.

La interfaz puede apuntar a otro host con `VITE_API_URL`. Para otro origen, define `FRONTEND_ORIGIN` con el origen exacto del sitio (por ejemplo, `https://radio.example`) y usa HTTPS en ambos servicios; la API habilitará CORS con credenciales solo para ese origen.

## Despliegue en Render

El archivo [`render.yaml`](../render.yaml) configura el servicio web con `backend/` como raíz, instala las dependencias desde `bun.lock`, ejecuta `bun run db:init` antes del despliegue y usa `/api/health` como health check. Crea el servicio desde Blueprint y define como secretos `DATABASE_URL`, `FRONTEND_ORIGIN`, `SESSION_SECRET` y las tres variables de Cloudinary.

Usa el pooler de PostgreSQL/Supabase y conserva `DATABASE_SSL=require` en Render. Después del primer despliegue, crea el administrador una sola vez desde una shell del servicio:

```bash
bun run admin:create
```
