# Sprint 4 · Fonoteca, buzón ciudadano y moderación

Documentos relacionados: [verificación/evidencias](sprint-4-verification.md) · [retrospectiva y espacio para el prompt](sprint-4-retrospective.md).

Sprint 4 extiende la API Express/PostgreSQL del Sprint 3 y conserva la interfaz React existente. El backend vive en `backend/` como paquete independiente. Ejecuta `npm --prefix backend run db:init` para aplicar el esquema y `npm --prefix backend run dev` para iniciar la API; la interfaz se inicia con `npm run dev`. Las fotos aprobadas se sirven optimizadas desde Cloudinary. Fotos y medios ciudadanos pendientes se almacenan como activos autenticados y solo moderación puede generar un enlace temporal para revisarlos.

## Historias implementadas

- HU-08: carga autenticada de audio en el panel, con título, categoría, idioma, duración y descripción. El servidor valida metadatos, tipo MIME, firma básica, archivo vacío y máximo de 50 MB; registra al operador.
- HU-09: Fonoteca pública con filtro de categoría, ficha del audio seleccionado y reproducción con controles nativos.
- HU-10: Buzón público adaptable a móvil, admite foto, audio o video de hasta 50 MB y contacto opcional privado. Una respuesta satisfactoria indica que el contenido quedó pendiente.
- HU-11: moderación bajo sesión válida, revisión con reproductor, aprobación con título público o rechazo; cada transición queda en `moderation_history`.

## Datos y privacidad

`media_audios` conserva metadatos y operador. `citizen_submissions` conserva archivo, estado y contacto opcional; las consultas públicas nunca devuelven envíos ciudadanos directamente. El endpoint de reproducción ciudadana solo sirve elementos aprobados. Las rutas de revisión requieren rol `operator` o `moderator`; las cuentas existentes reciben `operator` por migración. Los contactos se omiten de las respuestas administrativas y públicas.

## Evidencia manual

1. Inicia PostgreSQL, ejecuta `npm run db:init`, crea o usa una cuenta con `npm run admin:create`, luego inicia API e interfaz.
2. Sin sesión, intenta `POST /api/audios` y una ruta `/api/admin/submissions`: deben responder 401.
3. En Administración, carga un audio compatible con metadatos; confirma que aparece en Fonoteca, filtra su categoría y reproduce.
4. En Buzón ciudadano, envía una foto, audio y video válidos, confirma el mensaje de pendiente, y prueba un texto renombrado como audio; debe rechazarse.
5. En Administración → Moderación, revisa, reproduce y aprueba un envío; comprueba el título en Fonoteca/endpoint multimedia. Repite con rechazo y verifica que no se publica.
6. La evidencia de compilación disponible es `npm run build`; la base de datos local debe estar activa para completar el flujo integrado.
