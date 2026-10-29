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
| Carga de audio real, envío ciudadano de foto/audio/video y decisión de moderación | PENDIENTE DE EVIDENCIA MANUAL | Requiere PostgreSQL, Cloudinary, medios de prueba y una cuenta operadora local. Seguir los pasos de abajo. |

## Matriz de demostración manual

Con PostgreSQL configurado, ejecuta `npm run db:init`, inicia `npm run server` y `npm run dev`, y usa una cuenta creada con `npm run admin:create`.

1. **HU-08:** sin sesión, envía una carga a `POST /api/audios` y confirma HTTP 401. Después inicia sesión, carga un audio real con todos los metadatos y captura la confirmación y su ficha.
2. **HU-09:** abre Fonoteca, captura la lista, filtra por categoría, selecciona el audio, confirma sus metadatos y graba la reproducción. Comprueba también el diseño a 320, 360 y 390 px.
3. **HU-10:** desde un teléfono o emulación móvil, envía un audio y un video válidos. Captura la confirmación de cada uno. Intenta enviar un archivo de texto renombrado como audio y un archivo mayor a 50 MB; ambos deben fallar.
4. **HU-11:** en Administración → Moderación, revisa cada envío. Captura el estado `PENDIENTE`, el reproductor de revisión, la aprobación de uno y el rechazo de otro; revisa el historial. Confirma que solo el aprobado aparece en el área pública y que el rechazado no se publica.
5. **Permisos:** abre las rutas de moderación sin sesión (401) y prueba una sesión con un rol no autorizado si existe en el entorno (403). Los roles existentes se migran a `operator`, que puede moderar.
6. **Privacidad:** inspecciona las respuestas públicas y verifica que no incluyan contacto ciudadano ni envíos pendientes/rechazados.

## Archivos de evidencia

Guardar las capturas y videos de ejecución en `docs/evidence/sprint-4/` y anotar aquí el nombre de cada archivo, dispositivo/resolución y resultado. La carpeta queda preparada para incorporar los artefactos de la demostración real.
