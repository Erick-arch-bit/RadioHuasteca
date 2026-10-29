# Matriz de verificación · Sprint 5

Fecha de ejecución: 21 de octubre de 2026 (zona America/Mexico_City). Los resultados se limitan a los comandos ejecutados en este entorno.

## Pasos y resultado

| Prueba | Procedimiento | Esperado | Obtenido | Estado |
| --- | --- | --- | --- | --- |
| Compilación | `npm run build` | Exit 0 | Exit 0; CSS 34.28 kB, JS 290.30 kB antes de gzip | APROBADO |
| Lint | `npm run lint` | Exit 0 | Exit 0, sin salida de oxlint | APROBADO |
| Sprint 1 | `npm run verify:sprint1` | Criterios del sprint | 8 correctas, 0 fallas, 1 omitida; falta ffprobe y Chromium | PARCIAL |
| Sprint 2 | `npm run verify:sprint2` | Prueba UI | Timeout esperando `bulletin-player`; aplicación no estaba iniciada | FALLIDO |
| Sprint 3 | `npm run verify:sprint3` | UI, DB y login | No se confirmó ejecución integral; requiere servidor, Chromium, PostgreSQL y credenciales | PENDIENTE |
| Sprint 4 | `npm run evidence:sprint4` | Flujo carga/moderación | No ejecutado: script modifica y borra filas y medios de DB | BLOQUEADO por ausencia de DB aislada confirmada |
| `verify:sprint5` | `npm run verify:sprint5` | Estáticas + lint + build | Ejecutar después de agregar el comando | PENDIENTE |
| HTTP 401 / 403 y cookie | API con usuarios de roles distintos | 401/403, HttpOnly, Strict y Secure HTTPS | Revisado en código; no se hicieron solicitudes con backend activo | PENDIENTE |
| Avisos compartidos | CRUD admin PostgreSQL | Persistencia, publicación y consulta pública | Código actual utiliza `localStorage` | FALLIDO (requisito no implementado) |
| Audio / cargas / buzón / moderación | archivos de prueba y backend real | estados y privacidad correctos | No repetido con servicios activos en esta ejecución | PENDIENTE |
| Rendimiento 2G/3G | DevTools/Lighthouse, 3 ejecuciones comparables | carga inicial <3 s y reporte de pesos | Sin Chromium ni medición de red; no se inventan cifras | PENDIENTE |
| Responsive 320/360/390/escritorio | navegador real | sin overflow y controles utilizables | Sólo S1 omitió UI por Chromium ausente | PENDIENTE |
| Accesibilidad | teclado, lector, contraste y foco | sin defectos críticos | Revisión automatizada/manual no ejecutada | PENDIENTE |

## Matriz funcional requerida

Las pruebas de login vacío/incorrecto/correcto, usuario/correo, logout, sesión ausente/expirada, permisos 401/403, archivos válidos e inválidos, límite 50 MB, publicación privada, transiciones de moderación, audio alternativo y redes 2G/3G/offline quedan **PENDIENTES**. Requieren PostgreSQL de prueba, cuenta administrativa local, Chromium con CDP y medios sintéticos válidos. No reutilizar la base operativa para el guion que limpia registros de Sprint 4.

## Regresiones y evidencias

Las verificaciones S1–S3 se invocaron. S1 regeneró su informe de verificación; S2 expiró esperando un elemento de UI, pues no había servidor Vite activo. No se generaron nuevas capturas en Sprint 5. El informe automático de este comando se guarda en `docs/evidence/sprint-5/automated-verification.md`.

### Procedimiento de repetición manual

1. Usar una base de datos desechable restaurada desde esquema/backup; crear una cuenta con rol autorizado y otra no autorizada.
2. Iniciar `npm run server` y `npm run dev`; ejecutar pruebas API registrando método, endpoint, identidad de prueba y status HTTP, sin cookies ni secretos en artefactos.
3. Ejecutar Chrome DevTools/Lighthouse tres veces con perfil de red 3G idéntico; guardar informes y anotar navegador, versión, viewport y bytes transferidos por tipo.
4. Repetir las vistas requeridas en 320, 360, 390 y escritorio; registrar capturas reales sin datos personales.
5. Inspeccionar reproducción, errores y recuperación bajo red lenta/offline; verificar operaciones que dependen de conexión con mensaje claro.
