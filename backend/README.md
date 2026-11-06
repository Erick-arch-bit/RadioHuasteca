# RadioHuasteca API

Backend independiente de la interfaz. Ejecuta `bun install`, copia `.env.example` a `.env`, configura PostgreSQL y las credenciales de Cloudinary, luego usa `bun run db:init`, `bun run admin:create` y `bun run dev`.

La API completa usa Bun + Elysia y el driver `postgres` para autenticación, catálogo, avisos, fonoteca y moderación. Cloudinary almacena fotos, audios y videos; `POST /api/media/upload` recibe `FormData` nativo de Bun y devuelve `url`, `publicId` y `resourceType`. Las imágenes se entregan con `f_auto,q_auto,c_limit,w_400` para reducir datos en conexiones lentas.

El servidor de producción se inicia con `bun run src/index.ts`. La inicialización usa `bun run db:init` y la cuenta administrativa `bun run admin:create`. Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` solo en el entorno del servidor. Nunca uses estas credenciales en variables `VITE_*`.

La interfaz puede apuntar a otro host con `VITE_API_URL`. Para otro origen, define `FRONTEND_ORIGIN` con el origen exacto del sitio (por ejemplo, `https://radio.example`) y usa HTTPS en ambos servicios; la API habilitará CORS con credenciales solo para ese origen.
