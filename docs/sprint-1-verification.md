# Verificación y evidencias · Sprint 1 · RadioHuasteca

Documento asociado a [`docs/sprint-1-spec.md`](./sprint-1-spec.md).
Pasos aplicados de Spec-Driven Development: **SPEC → PLAN → IMPLEMENT → VERIFY → DOCS**.

- **Fecha de la verificación:** 25 de septiembre de 2026.
- **Rama:** `dev`.
- **Resultado global:** **20 correctas · 0 fallas · 0 omitidas** (exit code `0`).

## 1. Entorno de la verificación

| Elemento | Versión / detalle |
| --- | --- |
| Node.js | 24.x |
| npm | 11.x |
| Chromium (headless, vía CDP) | 152.0.7977.82 |
| ffmpeg / ffprobe | con `libopus` y `libmp3lame` |
| espeak-ng | voz `es-419` (español de Latinoamérica) |
| Sistema | Linux |

Las pruebas de interfaz se ejecutan contra el **build de producción** servido con `npm run preview`, no contra el servidor de desarrollo: es la versión que se presenta en la revisión.

## 2. Salida real de `npm run verify:sprint1`

```text
RadioHuasteca · verificación del Sprint 1
Repositorio: /home/dev/Documents/RadioHuasteca

[1/3] Comprobaciones estáticas
  ✔ CA-03.1  Audio real versionado en el repositorio (< 1.5 MB por archivo) — audio/boletin-demo.opus (156 KB) · audio/boletin-demo.mp3 (357 KB) · audio de demostración del Sprint 1
  ✔ CA-03.1b  Los archivos de audio se decodifican y duran más de 20 s — boletin-demo.opus: 60.9 s (ogg) · boletin-demo.mp3: 60.8 s (mp3)
  ✔ CA-03.1c  Sin audio sintético ni URLs externas en src/ — 16 archivos revisados
  ✔ CA-13.2  Paridad de claves ES / Hñähñu y sin cadenas vacías — 54 claves · 41 con propuesta en Hñähñu · 13 conservan español (declaradas como borrador)
  ✔ CA-02.1  Tailwind CSS activo: dependencia, plugin de Vite y hoja base — tailwindcss ^4.3.3
  ✔ CA-02.3  Sin CSS propio duplicado y sin código de sprints futuros — 14 archivos muertos eliminados
  ✔ CA-DOC.1–6  README alineado a RadioHuasteca con stack, Tailwind y evidencias — 13 elementos presentes
  ✔ CA-DOC.7  index.html en español, con el nombre del proyecto y descripción — lang, título y descripción correctos

[2/3] Build de producción
  ✔ CA-02.2  npm run build compila Tailwind y publica el audio del boletín — CSS 27 KB · JS 247.89 kB · audio publicado

[3/3] Interfaz real en Chromium headless (CDP)
  ✔ CA-12.1 · 320 px  Sin desplazamiento horizontal — documento 320 px / pantalla 320 px
  ✔ CA-12.1 · 360 px  Sin desplazamiento horizontal — documento 360 px / pantalla 360 px
  ✔ CA-12.1 · 390 px  Sin desplazamiento horizontal — documento 390 px / pantalla 390 px
  ✔ CA-12.2  Ningún bloque de contenido desborda su contenedor — 3 anchos revisados
  ✔ CA-12.3  Controles de la navegación inferior de al menos 36 px de alto — alturas 44 / 44 / 44 / 44 px
  ✔ CA-03.2 → CA-03.4  Reproducir, pausar, reanudar y detener el boletín real — formato elegido por el navegador: boletin-demo.opus · duración real 60.9 s
  ✔ CA-03.6  Estado de error anunciado y recuperable con Reintentar — error anunciado → reintento → reproducción recuperada
  ✔ CA-02n.2 → CA-02n.5  Menú móvil, destino activo y regreso sin perder el boletín — apertura/cierre del menú, aria-current y continuidad del audio verificados
  ✔ CA-13.3 / CA-13.4  Cambio ES/Hñähñu con aviso de traducción en borrador — ES ↔ Hñähñu con aviso de borrador verificados
  ✔ CA-12.4  Escritorio (≥ 681 px): tres accesos rápidos y menú móvil oculto — 3 columnas · sin desplazamiento horizontal
  ✔ CA-03.6b  Sin errores no controlados en la consola del navegador — 0 mensajes de error

Resumen: 20 correctas · 0 fallas · 0 omitidas
```

El mismo contenido queda registrado de forma automática en
[`docs/evidence/sprint-1/verification-report.md`](./evidence/sprint-1/verification-report.md).

## 3. Criterios de aceptación → evidencia

### HU-03 · Último boletín (el problema crítico del Sprint 1)

| Criterio | Verificación | Evidencia |
| --- | --- | --- |
| CA-03.1 · Archivo real versionado | `public/audio/boletin-demo.opus` (156 KB) y `public/audio/boletin-demo.mp3` (357 KB), ambos < 1.5 MB; ninguna URL externa ni `AudioContext` en `src/` | Salida `CA-03.1`, `CA-03.1b`, `CA-03.1c` |
| CA-03.2 · Inicio de reproducción | En 360 px: estado `idle` → clic en "Escuchar boletín" → estado `playing` con `currentTime > 0.3 s`; el navegador eligió **Opus** (`boletin-demo.opus`) | `reproduciendo-360px.png` + salida `CA-03.2 → CA-03.4` |
| CA-03.3 · Pausa y reanudación | Clic sobre el mismo botón → estado `paused`, el tiempo se conserva (`currentTime > 0.2 s`); segundo clic → `playing` desde la misma posición | `pausado-360px.png` |
| CA-03.4 · Detención | Clic en el botón cuadrado → estado `idle`, `currentTime === 0`, etiqueta del botón otra vez "Escuchar boletín" | Salida `CA-03.2 → CA-03.4` |
| CA-03.5 · Estado de carga | Estado `loading` ("Cargando audio…") al solicitar la reproducción, sin bloquear la interfaz; la duración se lee de `loadedmetadata` (**60.9 s**, igual que reporta ffprobe) | Salida `CA-03.2 → CA-03.4` |
| CA-03.6 · Error y recuperación | Se dispara `error` en el `<audio>` → estado `error` con "No fue posible reproducir el audio." y botón "Reintentar"; al pulsarlo, el audio vuelve a `playing` | `error-360px.png` + salida `CA-03.6` |
| CA-03.6b · Sin errores de consola | 0 mensajes de error y 0 excepciones en todo el recorrido | Salida `CA-03.6b` |
| CA-03.8 · Etiquetas bilingües | Título, resumen, etiqueta "Audio en español" y textos de estado cambian con el idioma activo | `hnahnu-360px.png` |

**Medición de los estados** (valores reales observados en la ejecución a 360 px):

| Paso | Estado | Texto observado | `currentTime` |
| --- | --- | --- | --- |
| Al cargar | `idle` | Listo para escuchar | `0` |
| Clic en reproducir | `playing` | Reproduciendo boletín | `≈ 0.9` |
| Clic en pausar | `paused` | Boletín en pausa | `> 0.2` (conservado) |
| Clic en continuar | `playing` | Reproduciendo boletín | `≥ 0.2` |
| Clic en detener | `idle` | Listo para escuchar | `0` |
| Fallo simulado | `error` | No fue posible reproducir el audio. | `0` |
| Clic en reintentar | `playing` | Reproduciendo boletín | avanza de nuevo |

> Nota técnica: la comprobación corre en Chromium *headless* con salida de audio silenciada (`--mute-audio`); aun así la decodificación es real, el tiempo avanza y el navegador informa la fuente efectiva (`currentSrc`), lo que demuestra que el archivo se reproduce. La escucha con altavoz se hace en la revisión manual (§5).

### Tailwind CSS

| Criterio | Verificación | Evidencia |
| --- | --- | --- |
| CA-02.1 · Tailwind activo | `tailwindcss ^4.3.3` y `@tailwindcss/vite` en `devDependencies`, plugin registrado en `vite.config.js` y `@import "tailwindcss"` + `@theme` en `src/index.css` | Salida `CA-02.1` |
| CA-02.2 · `npm install` + `npm run build` | `npm install` sin cambios pendientes; `npm run build` con código de salida 0, CSS compilado de **27 KB** (6.17 KB gzip) que incluye el breakpoint `681px` definido en `@theme`, y audio publicado en `dist/audio/` | Salida `CA-02.2` |
| CA-02.3 · Migración sin CSS propio duplicado | `src/App.css` eliminado; el único CSS propio es el import de Tailwind, los tokens `@theme`, la animación `reveal` y el foco visible global | Salida `CA-02.3` |
| CA-02.4 · Identidad visual | Paleta, tipografías y tarjeta con sombra desplazada conservadas (comparar con el diseño anterior en el historial de commits) | `inicio-320px.png`, `inicio-360px.png`, `inicio-390px.png`, `escritorio-1280px.png` |
| CA-02.5 · Breakpoints nombrados | `--breakpoint-xs: 400px` y `--breakpoint-desk: 681px` sustituyen a los `@media` escritos a mano | `src/index.css` |

### HU-12 · Mobile-first

| Ancho | Ancho del documento | Pantalla | Resultado | Captura |
| --- | --- | --- | --- | --- |
| 320 px | 320 px | 320 px | sin scroll horizontal | `inicio-320px.png` |
| 360 px | 360 px | 360 px | sin scroll horizontal | `inicio-360px.png` |
| 390 px | 390 px | 390 px | sin scroll horizontal | `inicio-390px.png` |
| 1280 px | 1280 px | 1280 px | 3 columnas en accesos rápidos, menú móvil oculto | `escritorio-1280px.png` |

Los cuatro botones de la navegación inferior miden **44 px de alto** (≥ 36 px exigidos) y ningún bloque marcado con `data-check-overflow` desborda su contenedor.

### HU-02 · Navegación

| Criterio | Verificación | Evidencia |
| --- | --- | --- |
| CA-02n.2 · El botón de menú responde | Abre el panel (`aria-expanded="true"`) y cierra con **Escape**, al **tocar el fondo** y al **elegir una opción** | Salida `CA-02n.2 → CA-02n.5` |
| CA-02n.3 · Destino activo | `aria-current="page"` en el destino elegido de la barra inferior | Salida `CA-02n.2 → CA-02n.5` |
| CA-02n.4 · El boletín no se interrumpe | Con el audio sonando se navegó a "Sobre la radio" y se volvió con "Volver al inicio": el elemento `<audio>` siguió con `paused = false` y el estado volvió a `playing` | Salida `CA-02n.2 → CA-02n.5` |
| CA-02n.5 · Regreso al inicio | El enlace de regreso restaura la pantalla de inicio y hace scroll al principio | Salida `CA-02n.2 → CA-02n.5` |

### HU-13 · Estructura bilingüe

| Criterio | Verificación | Evidencia |
| --- | --- | --- |
| CA-13.2 · Paridad de claves | 54 claves en `es` y 54 en `hnh`, sin cadenas vacías; 41 tienen propuesta provisional en Hñähñu y 13 conservan español (cubiertas por el aviso de borrador) | Salida `CA-13.2` |
| CA-13.3 · Selector ES/HN | Cambia el idioma con `aria-pressed` y actualiza `data-locale` en la raíz | Salida `CA-13.3 / CA-13.4` |
| CA-13.4 · Aviso de borrador | En modo Hñähñu aparece el aviso "Hñähñu en revisión · Borrador. Estructura en Hñähñu preparada: la traducción está pendiente de validación con hablantes de la comunidad y no es una versión final." con `data-translation-status="draft"`; al volver a español desaparece | `hnahnu-360px.png` |

### Documentación (criterio Técnica)

| Criterio | Verificación |
| --- | --- |
| CA-DOC.1–6 | El README nombra RadioHuasteca, describe la plataforma y Santa Ana Hueytlalpan, declara el stack real, documenta `npm install/dev/build/preview/lint/verify:sprint1`, explica el uso de Tailwind con ejemplos reales, indica cómo sustituir y regenerar el audio y enlaza la especificación y estas evidencias (13 elementos comprobados) |
| CA-DOC.7 | `index.html` con `lang="es"`, título "RadioHuasteca · La voz de Santa Ana Hueytlalpan" y meta descripción |

## 4. Archivos de evidencia

```
docs/evidence/sprint-1/
├── verification-report.md     informe generado automáticamente (tabla criterio → estado)
├── inicio-320px.png           pantalla de inicio en 320 px (sin scroll horizontal)
├── inicio-360px.png           pantalla de inicio en 360 px
├── inicio-390px.png           pantalla de inicio en 390 px
├── reproduciendo-360px.png    estado reproduciendo (boletín real, progreso y tiempo)
├── pausado-360px.png          estado en pausa conservando la posición
├── error-360px.png            estado de error con el botón Reintentar
├── hnahnu-360px.png           interfaz en Hñähñu con el aviso de traducción en revisión
└── escritorio-1280px.png      escritorio: dos columnas y rejilla de tres accesos
```

Todas las capturas se generan en la misma ejecución en la que se comprueban los criterios, de modo que no pueden quedar desactualizadas respecto al código verificado (mismo commit).

## 5. Verificación manual complementaria (Sprint Review)

Lo que **no** cubre la verificación automática y conviene mostrar en la revisión:

1. **Escucha real del boletín** en un celular o computadora con altavoz: pulsar "Escuchar boletín", pausar y detener.
2. **Celulares reales** (320/360/390 px) abriendo el servidor de la red local (`npm run dev -- --host`), verificando que los botones se alcanzan con el pulgar.
3. **Red lenta**: DevTools → Network → *Slow 3G* y, después, *Offline*, para observar los estados "Cargando audio…" y "No fue posible reproducir el audio.".
4. **Navegador alternativo** (Firefox o Safari/iOS) para confirmar que el respaldo MP3 del `<audio>` funciona donde Opus no está disponible.
5. **Sustitución del boletín de prueba** por el boletín real de la comunidad (guía en el README) y revisión del Hñähñu con hablantes antes de publicarlo.

## 6. Cómo reproducir estas evidencias

```bash
npm install
npm run verify:sprint1                       # todo: estático + build + interfaz real
node scripts/verify-sprint-1.mjs --static-only # solo comprobaciones estáticas
node scripts/verify-sprint-1.mjs --ui-only     # solo compilación + interfaz real
```

- Para las pruebas de interfaz se necesita `chromium` en el `PATH` (o la variable `CHROMIUM_BIN`). Si no está disponible, esas comprobaciones se muestran como **OMITIDAS** en lugar de fallar.
- El guion levanta `npm run preview` en el puerto `4319` y Chromium en el `9333`; ambos procesos se cierran al terminar.
- Cada ejecución reescribe `docs/evidence/sprint-1/verification-report.md` y las capturas, así que el informe siempre corresponde al estado actual del repositorio.

## 7. Conclusión

Los cinco criterios del Sprint 1 quedan verificados con evidencia reproducible:

- **HU-03**: el reproductor ya no genera un tono sintético; reproduce un archivo real versionado en Opus (con respaldo MP3), con los cinco estados exigidos, control de pausa/detención y recuperación ante errores.
- **Tailwind**: activo de punta a punta (plugin, tokens `@theme` y utilidades), sin CSS propio duplicado y sin regresiones visuales ni de responsividad.
- **HU-12**: 320, 360 y 390 px sin desplazamiento horizontal y con controles táctiles de 44 px.
- **HU-02**: navegación por iconos con menú móvil funcional (se corrigió el botón que no respondía) y el boletín no se interrumpe al navegar.
- **HU-13**: estructura bilingüe completa en claves, con aviso explícito de que el Hñähñu está pendiente de validación comunitaria.

Pendiente para los siguientes sprints (fuera del alcance de este documento): avisos por prioridad, fonoteca, trámites con apoyo auditivo, autenticación, panel administrativo y buzón ciudadano.



