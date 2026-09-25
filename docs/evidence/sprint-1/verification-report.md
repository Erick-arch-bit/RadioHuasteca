# Informe automático · Verificación del Sprint 1 · RadioHuasteca

- **Fecha de la ejecución:** 2026-09-25T21:04:37.262Z
- **Comando:** `node scripts/verify-sprint-1.mjs`
- **Resultado:** 20 correctas · 0 fallas · 0 omitidas

| Criterio | Comprobación | Estado | Detalle |
| --- | --- | --- | --- |
| CA-03.1 | Audio real versionado en el repositorio (< 1.5 MB por archivo) | PASS | audio/boletin-demo.opus (156 KB) · audio/boletin-demo.mp3 (357 KB) · audio de demostración del Sprint 1 |
| CA-03.1b | Los archivos de audio se decodifican y duran más de 20 s | PASS | boletin-demo.opus: 60.9 s (ogg) · boletin-demo.mp3: 60.8 s (mp3) |
| CA-03.1c | Sin audio sintético ni URLs externas en src/ | PASS | 16 archivos revisados |
| CA-13.2 | Paridad de claves ES / Hñähñu y sin cadenas vacías | PASS | 54 claves · 41 con propuesta en Hñähñu · 13 conservan español (declaradas como borrador) |
| CA-02.1 | Tailwind CSS activo: dependencia, plugin de Vite y hoja base | PASS | tailwindcss ^4.3.3 |
| CA-02.3 | Sin CSS propio duplicado y sin código de sprints futuros | PASS | 14 archivos muertos eliminados |
| CA-DOC.1–6 | README alineado a RadioHuasteca con stack, Tailwind y evidencias | PASS | 13 elementos presentes |
| CA-DOC.7 | index.html en español, con el nombre del proyecto y descripción | PASS | lang, título y descripción correctos |
| CA-02.2 | npm run build compila Tailwind y publica el audio del boletín | PASS | CSS 27 KB · JS 247.89 kB · audio publicado |
| CA-12.1 · 320 px | Sin desplazamiento horizontal | PASS | documento 320 px / pantalla 320 px |
| CA-12.1 · 360 px | Sin desplazamiento horizontal | PASS | documento 360 px / pantalla 360 px |
| CA-12.1 · 390 px | Sin desplazamiento horizontal | PASS | documento 390 px / pantalla 390 px |
| CA-12.2 | Ningún bloque de contenido desborda su contenedor | PASS | 3 anchos revisados |
| CA-12.3 | Controles de la navegación inferior de al menos 36 px de alto | PASS | alturas 44 / 44 / 44 / 44 px |
| CA-03.2 → CA-03.4 | Reproducir, pausar, reanudar y detener el boletín real | PASS | formato elegido por el navegador: boletin-demo.opus · duración real 60.9 s |
| CA-03.6 | Estado de error anunciado y recuperable con Reintentar | PASS | error anunciado → reintento → reproducción recuperada |
| CA-02n.2 → CA-02n.5 | Menú móvil, destino activo y regreso sin perder el boletín | PASS | apertura/cierre del menú, aria-current y continuidad del audio verificados |
| CA-13.3 / CA-13.4 | Cambio ES/Hñähñu con aviso de traducción en borrador | PASS | ES ↔ Hñähñu con aviso de borrador verificados |
| CA-12.4 | Escritorio (≥ 681 px): tres accesos rápidos y menú móvil oculto | PASS | 3 columnas · sin desplazamiento horizontal |
| CA-03.6b | Sin errores no controlados en la consola del navegador | PASS | 0 mensajes de error |

> Generado automáticamente. No editar a mano: vuelve a ejecutar `npm run verify:sprint1`.
