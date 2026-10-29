# Incidencias · Sprint 5

| ID | Prioridad | Incidencia | Responsable | Corrección | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| S5-01 | Alta | Avisos creados desde vista pública se guardan en `localStorage`, sin sesión ni persistencia compartida | Sin asignar | Requiere CRUD PostgreSQL autenticado y migración compatible | `src/hooks/useNotices.js`, `src/components/NoticeView.jsx` | ABIERTA |
| S5-02 | Alta | No se verificó respuesta 403 ni acceso privado de archivos contra backend activo | Sin asignar | Ejecutar matriz de roles y rutas en DB aislada | Sprint 4 API revisada estáticamente | ABIERTA |
| S5-03 | Media | Pruebas UI no reproducibles sin iniciar Vite; Sprint 2 espera `bulletin-player` y termina en timeout | Sin asignar | Preparar servidor de prueba e investigar selector desactualizado | Salida `npm run verify:sprint2` | ABIERTA |
| S5-04 | Media | Sin captura/informe 3G ni prueba responsive integral | Sin asignar | Usar Chromium/DevTools y registrar tres corridas | Entorno sin Chromium detectado por S1 | ABIERTA |
| S5-05 | Media | No se repitió el guion de Sprint 4 por su limpieza de filas y medios | Sin asignar | Ejecutarlo únicamente en DB desechable aislada | `scripts/capture-sprint-4-evidence.mjs` | BLOQUEADA |
| S5-06 | Media | Falta política automatizada de limpieza de medios huérfanos / análisis antivirus | Sin asignar | Definir retención y proceso de reconciliación no destructivo | `docs/sprint-4-retrospective.md` | ABIERTA |

No se conoce un error crítico reproducido en esta revisión; eso no equivale a una auditoría de seguridad aprobada. No se creó commit/etiqueta porque el repositorio contiene cambios preexistentes sin confirmar.
