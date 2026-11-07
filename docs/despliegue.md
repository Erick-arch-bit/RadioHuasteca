# Guía de despliegue

## API en Render

1. Crea un servicio a partir de `render.yaml`.
2. Configura `DATABASE_URL`, `FRONTEND_ORIGIN`, `SESSION_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` como secretos. Usa un secreto aleatorio de 32 caracteres o más.
3. `preDeployCommand` ejecuta `bun run db:init`. Tras el primer despliegue crea una cuenta con `bun run admin:create`, usando `ADMIN_USERNAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno.
4. Comprueba `https://<api>/api/health`.

## Interfaz en Cloudflare Pages

1. Conecta el repositorio y configura `npm run build` como comando y `dist` como directorio de salida.
2. Añade `VITE_API_URL` con el origen HTTPS de la API.
3. Define el origen HTTPS exacto del sitio en Render como `FRONTEND_ORIGIN` y vuelve a desplegar la API.
4. Configura el dominio personalizado en Cloudflare Pages. Añade el dominio final a `FRONTEND_ORIGIN`.
5. Confirma login, persistencia de sesión, carga de archivos y CORS desde el dominio publicado.

Los dominios, datos de demostración y medios de producción se completan al tener las cuentas de Cloudflare, Render, PostgreSQL y Cloudinary. No se guardan claves en el repositorio.

## Verificación local

```sh
npm install
npm run build
npm run lint
```

En `backend/`, instala con `bun install`, configura `.env`, ejecuta `bun run db:init` y `bun run dev`. El archivo `public/_headers` establece caché para los recursos con hash y los audios versionados.
