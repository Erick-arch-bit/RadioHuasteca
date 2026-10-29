# Verificación y evidencias · Sprint 4

Fecha de revisión: 14 de octubre de 2026
Alcance de esta revisión: compilación, lint, migración PostgreSQL, disponibilidad del API y rechazo de moderación sin sesión.

## Resultado ejecutado

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm run db:init` | PASS | Aplicó el esquema aditivo y terminó con “Esquema y trámites de demostración listos.” |
| Arranque de Express | PASS | El servidor escuchó en `http://localhost:3001`. |
| `GET /api/health` | PASS | Respondió `{"status":"ok"}`. |
| `GET /api/audios` | PASS | Respondió una lista vacía válida en la base de datos revisada. |
| `GET /api/admin/submissions` sin cookie | PASS | Respondió HTTP 401. |
| `npm run build` | PASS | Vite compiló la aplicación de producción. |
| `npm run lint` | PASS | Oxlint terminó sin advertencias. |
| `node --check server/index.js` | PASS | Sintaxis válida. |
| Flujo local de carga, envío y moderación con medios de prueba | PASS | Cuenta local: cargó un MP3 de muestra de 38 s y generó un MP4 de prueba de 3 s; envío, rechazo de texto, estados, historial y publicación aprobada se capturaron en los PNG de abajo. |

## Matriz de demostración manual

Con PostgreSQL configurado, ejecuta `npm run db:init`, inicia `npm run server` y `npm run dev`, y usa una cuenta creada con `npm run admin:create`.

1. **HU-08:** sin sesión, envía una carga a `POST /api/audios` y confirma HTTP 401. Después inicia sesión, carga un audio real con todos los metadatos y captura la confirmación y su ficha.
2. **HU-09:** abre Fonoteca, captura la lista, filtra por categoría, selecciona el audio, confirma sus metadatos y graba la reproducción. Comprueba también el diseño a 320, 360 y 390 px.
3. **HU-10:** desde un teléfono o emulación móvil, envía un audio y un video válidos. Captura la confirmación de cada uno. Intenta enviar un archivo de texto renombrado como audio y un archivo mayor a 50 MB; ambos deben fallar.
4. **HU-11:** en Administración → Moderación, revisa cada envío. Captura el estado `PENDIENTE`, el reproductor de revisión, la aprobación de uno y el rechazo de otro; revisa el historial. Confirma que solo el aprobado aparece en el área pública y que el rechazado no se publica.
5. **Permisos:** abre las rutas de moderación sin sesión (401) y prueba una sesión con un rol no autorizado si existe en el entorno (403). Los roles existentes se migran a `operator`, que puede moderar.
6. **Privacidad:** inspecciona las respuestas públicas y verifica que no incluyan contacto ciudadano ni envíos pendientes/rechazados.

## Archivos de evidencia

Con PostgreSQL, `npm run server` y `npm run dev` activos, ejecuta `npm run evidence:sprint4`. Ejecutado el 14 de octubre de 2026: el capturador usó la cuenta local de `.env`, un MP3 de muestra de 38 s y un MP4 temporal generado localmente de 3 s. Comprobó confirmación del buzón, rechazo de un archivo de texto, registro como pendiente, aprobación/rechazo, historial y publicación del aprobado. Limpió filas y medios temporales de la base al terminar. Capturas en viewport móvil de 390 × 844 px (las pantallas largas de moderación usan captura completa):

- `01-fonoteca-audio-seleccionado.png` y `08-fonoteca-audio-reproduciendo.png`: filtro, ficha y reproducción.
- `02-buzon-ciudadano-movil.png`, `03-buzon-archivo-invalido.png` y `04-buzon-confirmacion-envio.png`: formulario móvil, rechazo y confirmación.
- `05-moderacion-pendientes-audio-video.png` y `06-moderacion-aprobado-rechazado.png`: pendientes y decisiones.
- `07-fonoteca-contenido-ciudadano-aprobado.png`: publicación del contenido aprobado.
- `09-admin-carga-audio-confirmacion.png`: carga desde el formulario autenticado del operador y confirmación.

El flujo completo está automatizado con muestras locales; todavía se debe repetir con un teléfono real y medios aportados por la comunidad antes de aceptar el producto en su entorno de operación.

Las capturas y videos de una demostración hecha en teléfono real pueden agregarse a la misma carpeta con su dispositivo/resolución y resultado anotados aquí.
