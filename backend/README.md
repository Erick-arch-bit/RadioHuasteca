# RadioHuasteca API

Backend independiente de la interfaz. Ejecuta `npm install`, copia `.env.example` a `.env`, configura PostgreSQL y las credenciales de Cloudinary, luego usa `npm run db:init`, `npm run admin:create` y `npm run dev`.

La API Express usa PostgreSQL para cuentas, catálogo, avisos y moderación. Cloudinary almacena fotos, audios y videos. Los envíos ciudadanos se cargan como activos `authenticated`; el backend genera enlaces temporales de revisión y cambia el tipo de entrega al aprobar. Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` solo en el entorno del servidor. Nunca uses estas credenciales en variables `VITE_*`.

La interfaz puede apuntar a otro host con `VITE_API_URL`. Para otro origen, define `FRONTEND_ORIGIN` con el origen exacto del sitio (por ejemplo, `https://radio.example`) y usa HTTPS en ambos servicios; la API habilitará CORS con credenciales solo para ese origen.
