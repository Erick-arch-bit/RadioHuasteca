# Especificación técnica · Sprint 1 · RadioHuasteca

> Documento generado siguiendo **Spec-Driven Development (SDD)**.
> Orden aplicado: **SPEC → PLAN → IMPLEMENT → VERIFY → DOCS**.
> Ningún cambio de código se realiza si no está descrito aquí.

- **Proyecto:** RadioHuasteca — plataforma web de radio comunitaria indígena de baja conectividad.
- **Comunidad:** Santa Ana Hueytlalpan, Hidalgo, México.
- **Sprint:** 1 (semanas 3 y 4). **Fecha de la spec:** 25 de septiembre de 2026.
- **Rama:** `dev`.
- **Sprint Goal (plan de proyecto):** *Construir la estructura inicial de RadioHuasteca con una interfaz móvil, navegación clara y reproducción del último boletín.*
- **Historias cubiertas:** HU-02 (navegación), HU-03 (último boletín), HU-12 (mobile-first), HU-13 (estructura bilingüe) y criterio Técnica (React/Vite/Tailwind + README).
- **Documento de evidencias asociado:** [`docs/sprint-1-verification.md`](./sprint-1-verification.md).

---

## 1. Alcance

### 1.1 Dentro del alcance

1. Reproductor de audio **real** del último boletín (HU-03).
2. Migración de los estilos del Sprint 1 a **Tailwind CSS** sin regresión visual ni de responsividad (HU-02, HU-12).
3. Navegación por iconos **funcional** (menú móvil que abre y cierra + nav inferior + accesos rápidos + regreso al inicio) (HU-02).
4. Estructura bilingüe ES / Hñähñu con etiquetado honesto de borrador (HU-13).
5. README y documentación de evidencias alineados a RadioHuasteca (criterio Técnica).

### 1.2 Fuera del alcance (no implementar)

Avisos comunitarios (HU-01), fonoteca/catálogo de audios (HU-04), trámites (HU-05), login (HU-06), administración (HU-07), buzón ciudadano, notas de voz, backend Node/Express, PostgreSQL, almacenamiento remoto. Cualquier código existente que implemente lo anterior y no esté referenciado por el Sprint 1 **se elimina** (ver §2.5).

### 1.3 Decisiones de arquitectura

| Decisión | Justificación |
|---|---|
| Audio en `public/audio/` (no importado por el bundler) | Se sirve tal cual, se cachea por URL estable y queda versionado en el repo; es la opción que el plan autoriza explícitamente. |
| Doble formato: **Opus/Ogg (preferido) + MP3 (fallback)** | Opus es el más ligero para voz; el MP3 cubre Safari/iOS y navegadores antiguos. El navegador elige con `<source>`. |
| Fuente de audio local, sin CDN de terceros | Requisito de baja conectividad: el Sprint 1 debe funcionar sin internet y sin fugas a servicios externos. |
| Estado del reproductor en un hook (`useBulletinAudio`) | Separa la máquina de estados de audio de la vista; componente declarativo y verificable. |
| `translations.js` sin JSX | Permite que la verificación automática importe el diccionario en Node y compare paridad de claves ES/Hñähñu. |
| Tailwind v4 con tokens en `@theme` | v4 es la versión ya instalada; los tokens conservan la identidad visual (paleta Huasteca, Georgia/Trebuchet). |
| Sin dependencias nuevas | Restricción de peso del proyecto (gama baja, red lenta). El script de verificación usa Node estándar + Chromium del sistema. |

---

## 2. Especificación por problema

### 2.1 HU-03 — Reproductor real del último boletín (CRÍTICO)

#### 2.1.1 Comportamiento esperado — Given / When / Then

**CA-03.1 — Archivo real versionado**
- **Dado** que el proyecto debe funcionar sin conexión a internet,
- **Cuando** el proyecto se compila o se ejecuta en local,
- **Entonces** existen `public/audio/boletin-demo.opus` y `public/audio/boletin-demo.mp3`, cada uno **< 1.5 MB**, decodificables y con duración > 20 s, y el reproductor **no** apunta a ninguna URL externa.

**CA-03.2 — Inicio de reproducción**
- **Dado** que el boletín de prueba está disponible y el estado es `idle` (Listo para escuchar),
- **Cuando** la persona pulsa "Escuchar boletín",
- **Entonces** el elemento `<audio>` reproduce el archivo real, el estado pasa a `playing` (Reproduciendo boletín) y el contador de tiempo avanza.

**CA-03.3 — Pausa / reanudación**
- **Dado** que el audio está en `playing`,
- **Cuando** la persona pulsa el mismo botón,
- **Entonces** el audio se pausa, el estado pasa a `paused` (Boletín en pausa) y el botón reanuda desde el tiempo actual.

**CA-03.4 — Detención**
- **Dado** que el audio está en `playing` o `paused`,
- **Cuando** la persona pulsa "Detener boletín",
- **Entonces** el audio se pausa, `currentTime` vuelve a `0`, el estado vuelve a `idle` y el botón principal muestra de nuevo "Escuchar boletín".

**CA-03.5 — Estado de carga**
- **Dado** que el archivo aún no cargó sus metadatos o el navegador espera al búfer,
- **Cuando** la persona solicita la reproducción,
- **Entonces** la UI muestra "Cargando audio…" (`loading`) hasta que el elemento confirma la reproducción, sin congelar la interfaz (el `await play()` nunca bloquea el hilo de UI).

**CA-03.6 — Error y recuperación**
- **Dado** que el archivo no puede reproducirse (formato no soportado, archivo ausente, red caída),
- **Cuando** el elemento `<audio>` emite `error` o la promesa de `play()` se rechaza con un error distinto a `AbortError`,
- **Entonces** la UI muestra "No fue posible reproducir el audio." (`error`), ofrece "Reintentar" y **no** se produce ningún error no controlado en consola.

**CA-03.7 — Fin del audio**
- **Dado** que el audio llega a su fin,
- **Cuando** se emite `ended`,
- **Entonces** el estado vuelve a `idle`, `currentTime` es `0` y el botón principal vuelve a ofrecer "Escuchar boletín".

**CA-03.8 — Etiquetas bilingües del boletín**
- **Dado** que el boletín es contenido prioritario,
- **Cuando** la interfaz se muestra en cualquiera de los dos idiomas,
- **Entonces** título, resumen, etiqueta de idioma del audio y textos de estado aparecen en el idioma activo, y en modo Hñähñu se indica que la traducción está **pendiente de validación comunitaria**.

#### 2.1.2 Máquina de estados (fuente de verdad)

| Estado | Etiqueta visible (ES) | Entradas | Salidas |
|---|---|---|---|
| `idle` | Listo para escuchar | inicial, `stop`, `ended` | `play` → `loading` |
| `loading` | Cargando audio… | `play()` solicitado, `waiting`, `loadstart` sin datos | `playing`, `paused`, `error` |
| `playing` | Reproduciendo boletín | evento `playing` | `pause` → `paused`, `ended` → `idle`, `error` |
| `paused` | Boletín en pausa | evento `pause` (no por `ended`) | `play` → `loading`/`playing`, `stop` → `idle` |
| `error` | No fue posible reproducir el audio. | `error` en `<audio>` o en algún `<source>`, rechazo de `play()` ≠ `AbortError` | `retry` → `loading`, `stop` → `idle` |

Reglas de robustez:
- Un rechazo de `play()` con `name === 'AbortError'` (p. ej. play seguido de pause) **no** es error: se ignora.
- `preload="metadata"`: no se descarga el boletín completo al abrir la página (baja conectividad).
- La duración mostrada sale de `loadedmetadata`; si aún no hay metadatos se muestra `--:--` (nunca un valor inventado).

#### 2.1.3 Contrato de UI del reproductor

| Elemento | Etiqueta / atributo de prueba | Comportamiento |
|---|---|---|
| Botón principal | `aria-label` = "Escuchar boletín" / "Pausar boletín" / "Continuar boletín"; `data-testid="player-toggle"` | alterna play/pause |
| Botón detener | `aria-label` = "Detener boletín"; `data-testid="player-stop"` | pausa + reinicia a 0 |
| Estado | `role="status"`, `aria-live="polite"`, `data-testid="player-status"` | texto según máquina de estados |
| Contenedor | `data-testid="bulletin-player"`, `data-state`, `data-audio-src` | expone el estado para verificación automática |
| Progreso | `role="progressbar"` con `aria-valuemin`/`aria-valuemax`/`aria-valuenow`; `data-testid="player-progress"` | avance real del audio |
| Tiempos | `data-testid="player-time"` | `mm:ss / mm:ss` reales |

### 2.2 Tailwind CSS

**CA-02.1** — `package.json` declara `tailwindcss` y `@tailwindcss/vite`; `vite.config.js` registra el plugin; `src/index.css` contiene `@import "tailwindcss"`.
**CA-02.2** — `npm install` y `npm run dev` arrancan sin errores y el CSS compilado contiene utilidades Tailwind.
**CA-02.3** — Toda la UI del Sprint 1 se expresa con utilidades Tailwind. El único CSS propio que se conserva en `src/index.css` es: import de Tailwind, tokens `@theme` (colores, tipografías, breakpoints), `@keyframes` de la animación de entrada y 3 reglas base justificadas en §2.6. `src/App.css` se elimina.
**CA-02.4** — Identidad visual preservada: paleta `ink/forest/water/clay/sun/cream/paper/line`, títulos en serif (Georgia), texto en sans (Trebuchet MS), tarjeta del boletín con borde y sombra desplazada, ilustración de cerros/río/sol.
**CA-02.5** — El punto de cambio móvil/escritorio se define con el breakpoint nombrado `desk` (≥ 681 px) y el ajuste de celular pequeño con `xs` (< 400 px), sustituyendo los `@media` escritos a mano.

### 2.3 HU-12 — Mobile-first

**CA-12.1** — En 320 px, 360 px y 390 px de ancho no existe desplazamiento horizontal: `document.documentElement.scrollWidth <= window.innerWidth + 1`.
**CA-12.2** — Ningún nodo marcado con `data-check-overflow` desborda su contenedor (`scrollWidth <= clientWidth + 1`).
**CA-12.3** — Los botones de la navegación inferior miden al menos 36 px de alto y son operables con una mano.
**CA-12.4** — Una sola columna en móvil; en `desk`: dos columnas en el boletín y rejilla de tres accesos rápidos.
**CA-12.5** — `body` conserva `min-width: 320px` y no aparece scroll horizontal ni con textos largos.

### 2.4 HU-02 — Navegación por iconos y HU-13 — Estructura bilingüe

**CA-02n.1** — Existen cuatro destinos: `inicio`, `avisos`, `tramites`, `sobre`; cada uno con icono Lucide y etiqueta textual (no solo icono).
**CA-02n.2** — El botón de menú del topbar **responde**: abre/cierra un panel con los cuatro destinos, expone `aria-expanded` y `aria-controls`, cierra al elegir una opción, con `Escape` y al tocar el fondo.
**CA-02n.3** — La navegación inferior (`<nav aria-label>`) marca el destino activo con `aria-current="page"` y color de acento.
**CA-02n.4** — Desde cualquier vista interna se puede volver a `inicio` con el enlace "Volver al inicio"; ese regreso **no** reinicia ni interrumpe el audio boletín (el elemento `<audio>` vive en la raíz de la app).
**CA-02n.5** — El regreso a inicio hace scroll al top de la página.

**CA-13.1** — Todo texto de interfaz proviene de `src/i18n/translations.js`; no quedan cadenas literales en los componentes.
**CA-13.2** — Paridad de claves: `es` y `hnh` tienen exactamente el mismo conjunto de claves y ninguna cadena vacía.
**CA-13.3** — El selector ES/HN alterna el idioma, con `aria-pressed` y `lang`/`data-locale` en la raíz.
**CA-13.4** — En modo Hñähñu aparece un aviso visible de **borrador**: la traducción está pendiente de validación con hablantes de la comunidad; los textos en Hñähñu nunca se presentan como traducción terminada.

### 2.5 Limpieza de código y recursos (correcciones a la spec)

| Archivo | Acción | Motivo |
|---|---|---|
| `src/App.css` | Eliminar | Su contenido se migra a utilidades Tailwind (§2.2). |
| `src/components/PlayerHero.jsx` | Eliminar | Genera audio con `AudioContext`/`createOscillator`; contradice HU-03 (audio real) y no está referenciado. |
| `src/components/{CommunityFeed,Eventos,LivePodcasts,Participa,PostModal,RightRail,Sidebar,Trámites,WorkspaceHeader}.jsx` | Eliminar | Código muerto (0 referencias) de alcance Sprint 2+ (avisos, fonoteca, buzón, trámites, login): el plan prohíbe adelantar funcionalidad. |
| `src/data/radioData.js` | Eliminar | Datos inventados de módulos fuera de alcance; solo lo consumían los componentes muertos. |
| `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg` | Eliminar | Recursos plantilla de Vite sin referencia alguna. |
| `src/assets/hero.png` | Conservar | Recurso propio del proyecto, no referenciado: Vite no lo incluye en el build, por lo que no afecta el peso de la app. |
| `public/favicon.svg` | Conservar | Referenciado por `index.html`. |

### 2.6 CSS propio que se conserva (justificación obligatoria)

Se conserva **solo** en `src/index.css`:

| Regla | Justificación |
|---|---|
| `@import "tailwindcss"` | Activa Tailwind v4. |
| `@theme { … }` (tokens) | API oficial de Tailwind v4 para declarar paleta, tipografías y breakpoints del proyecto; no duplica utilidades, las genera. |
| `@keyframes reveal` dentro de `@theme` | Necesario para el token `--animate-reveal`; Tailwind no incluye esta animación. |
| `:focus-visible { outline: 3px solid … }` | Accesibilidad transversal: un solo lugar define el foco visible para todos los controles, en lugar de repetir utilidades de foco. |
| `@layer base` (no se añaden más reglas) | El `box-sizing` y el `margin: 0` del `body` ya los aporta el *Preflight* de Tailwind, por lo que **no** se duplican. El ancho mínimo de 320 px (HU-12) se aplica con la utilidad `min-w-80` en el contenedor raíz de `App.jsx`, no con CSS propio. |

`src/App.css` no conserva ninguna regla.

### 2.7 README y documentación (criterio Técnica)

**CA-DOC.1** — El README nombra **RadioHuasteca** y describe la plataforma de radio comunitaria indígena de baja conectividad para Santa Ana Hueytlalpan, Hidalgo (avisos, boletines de audio, contenidos bilingües ES/Hñähñu).
**CA-DOC.2** — El README declara el stack real: React, Vite, Tailwind CSS v4, lucide-react.
**CA-DOC.3** — El README documenta `npm install`, `npm run dev`, `npm run build`, `npm run preview`, además de `npm run lint` y `npm run verify:sprint1`.
**CA-DOC.4** — El README explica **cómo se usa Tailwind en este proyecto** (tokens en `@theme`, ejemplos reales de clases usadas, breakpoints `xs`/`desk`, regla de no añadir CSS propio).
**CA-DOC.5** — El README indica cómo sustituir el boletín de prueba por el boletín real y cómo regenerarlo con `scripts/generate-bulletin-audio.sh`.
**CA-DOC.6** — El README explica cómo reproducir las evidencias (script de verificación, matriz manual 320/360/390 px, revisión de estados del reproductor) y enlaza `docs/sprint-1-spec.md` y `docs/sprint-1-verification.md`.
**CA-DOC.7** — `index.html` declara `lang="es"`, un título que contiene "RadioHuasteca" y una meta descripción del proyecto.

---

## 3. PLAN — Archivos y orden de implementación

### 3.1 Archivos nuevos

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `docs/sprint-1-spec.md` | Esta especificación (SPEC + PLAN). |
| 2 | `scripts/generate-bulletin-audio.sh` | Genera el audio de prueba (voz ES con `espeak-ng`, normalizada y comprimida con `ffmpeg`) en Opus + MP3. Reproducible. |
| 3 | `public/audio/boletin-demo.opus`, `public/audio/boletin-demo.mp3` | Audio real del boletín de prueba, versionado, < 1.5 MB cada uno. |
| 4 | `src/i18n/translations.js` | Diccionarios `es`/`hnh` (sin JSX), claves de estado del reproductor, etiquetas de borrador y metadatos de idioma. |
| 5 | `src/data/navigation.js` | Destinos, `labelKey` e iconos Lucide. |
| 6 | `src/data/bulletin.js` | Metadatos del boletín + lista de fuentes de audio (`<source>` Opus/MP3). |
| 7 | `src/hooks/useBulletinAudio.js` | Máquina de estados del audio (§2.1.2), duración real, progreso, `retry`, `stop`. |
| 8 | `src/components/BulletinAudio.jsx` | Elemento `<audio>` en la raíz de la app: sobrevive a la navegación (CA-02n.4) y declara los dos `<source>`. |
| 9 | `src/components/BulletinPlayer.jsx` | UI del reproductor con el contrato de §2.1.3. |
| 10 | `src/components/TopBar.jsx` | Marca, selector ES/HN y botón de menú funcional. |
| 11 | `src/components/MobileMenu.jsx` | Panel de menú móvil accesible (CA-02n.2). |
| 12 | `src/components/WelcomeBlock.jsx` | Bloque de bienvenida. |
| 13 | `src/components/BulletinCard.jsx` | Tarjeta del último boletín + reproductor + ilustración. |
| 14 | `src/components/QuickNav.jsx` | Accesos rápidos a los tres destinos secundarios. |
| 15 | `src/components/InnerView.jsx` | Vista interna con regreso a inicio (vistas de incrementos futuros). |
| 16 | `src/components/BottomNav.jsx` | Navegación inferior con iconos y `aria-current`. |
| 17 | `src/components/LanguageDraftNotice.jsx` | Aviso de traducción en borrador (CA-13.4). |
| 18 | `scripts/verify-sprint-1.mjs` | Verificación automática de los criterios (§4). |
| 19 | `docs/sprint-1-verification.md` | Evidencias obtenidas y salidas de comandos. |
| 20 | `docs/evidence/sprint-1/*.png` | Capturas generadas por la verificación (320/360/390 px y estados del reproductor). |

### 3.2 Archivos modificados

| Orden | Archivo | Cambio |
|---|---|---|
| 1 | `src/index.css` | Tokens `@theme` (colores, tipografías, breakpoints `xs`/`desk`), animación y base mínima. |
| 2 | `src/App.jsx` | Reescritura con utilidades Tailwind, estado de idioma, vista activa y composición de componentes. |
| 3 | `index.html` | `lang="es"`, título, meta descripción, `theme-color`. |
| 4 | `package.json` | Nombre/descripción/versión del proyecto y scripts `lint`, `verify:sprint1`, `audio:generate`. |
| 5 | `README.md` | Reescritura completa (CA-DOC.1…6). |

### 3.3 Archivos eliminados

Ver §2.5.

### 3.4 Orden de ejecución

1. SPEC (este documento).
2. Generar y versionar el audio de prueba.
3. i18n + datos + hook de audio.
4. Componentes y `App.jsx`.
5. Tokens Tailwind en `index.css`; eliminar `App.css` y el código muerto.
6. `index.html`, `package.json`.
7. Script de verificación → ejecutar y corregir hasta que pase.
8. Evidencias en `docs/sprint-1-verification.md` + README.
9. `npm run lint` + `npm run build` finales.

---

## 4. VERIFY — Verificación automática y manual

### 4.1 Verificación automática (`npm run verify:sprint1`)

`scripts/verify-sprint-1.mjs` comprueba, sin dependencias nuevas:

1. **Estático**
   - audio: existen ambos archivos, peso < 1.5 MB, `ffprobe` los decodifica y su duración > 20 s;
   - i18n: paridad exacta de claves `es`/`hnh` y sin cadenas vacías;
   - no queda uso de `AudioContext`/`createOscillator` ni URLs de audio externas (`http`) en `src/`;
   - Tailwind activo (`package.json`, `vite.config.js`, `index.css`);
   - `src/App.css` no existe y `src/` no contiene ninguno de los archivos muertos de §2.5;
   - README e `index.html` cumplen CA-DOC.
2. **Build**: `npm run build` termina con código 0, `dist/index.html` referencia CSS hasheado y `dist/audio/` contiene los dos formatos.
3. **UI real** (Chromium headless por CDP) sirviendo con `npm run preview`:
   - 320/360/390 px sin scroll horizontal (CA-12.1) ni desbordes en nodos marcados (CA-12.2);
   - altura de los botones de la navegación inferior (CA-12.3);
   - ciclo completo del reproductor con audio real: `idle` → clic → `playing` con `currentTime > 0.3` → clic → `paused` → clic → `playing` → clic en detener → `idle` con `currentTime === 0` (CA-03.2…CA-03.4);
   - duración real obtenida de `loadedmetadata` (CA-03.5);
   - estado de error forzado (`error` + botón de reintento) y ausencia de errores de consola no controlados (CA-03.6);
   - navegación: el menú móvil abre y cierra, `aria-current` en la nav inferior, regreso a inicio sin perder el audio (CA-02n.2…CA-02n.5);
   - cambio a Hñähñu: aviso de borrador visible y `data-locale` actualizado (CA-13.3, CA-13.4);
   - capturas guardadas en `docs/evidence/sprint-1/`.

### 4.2 Verificación manual (equipo, para la Sprint Review)

- Matriz de anchos 320/360/390 px en DevTools del navegador (las capturas las genera el script).
- Escuchar el boletín con datos móviles simulados (Slow 3G) y sin acceso a internet.
- Revisar la consola del navegador: sin errores no controlados.
- Sustituir el boletín de prueba por el boletín real de la comunidad y validar el Hñähñu con hablantes.

---

## 5. Restricciones y riesgos considerados

| Riesgo (plan de proyecto) | Mitigación aplicada en el Sprint 1 |
|---|---|
| Baja conectividad regional | `preload="metadata"`, Opus ligero (~0.2 MB) con fallback MP3, sin CDNs externos, sin librerías añadidas. |
| Problemas de reproducción de audio | Doble formato con `<source>`, máquina de estados explícita, manejo de `AbortError`, botón de reintento. |
| Traducciones incorrectas al Hñähñu | El modo HN se marca como borrador pendiente de validación comunitaria (CA-13.4). |
| Interfaz demasiado compleja | Sin dependencias nuevas, textos breves, controles ≥ 36 px, verificación a 320 px. |
| Saturación de tareas | Se elimina el código de sprints futuros (§2.5) para que el repositorio refleje solo el Sprint 1. |

---

## 6. Definition of Done aplicada a este documento

- [x] SPEC escrita antes de tocar código (§1–§2).
- [x] PLAN con archivos y orden (§3).
- [x] IMPLEMENT solo de lo especificado.
- [x] VERIFY con salidas reales de comandos (§4 y `docs/sprint-1-verification.md`).
- [x] DOCS: README + evidencias reproducibles.

### 6.1 Desviaciones registradas durante la implementación

| Desviación | Motivo | Estado |
| --- | --- | --- |
| Se añadió `src/components/BulletinAudio.jsx` (no estaba en el primer borrador del PLAN) | `oxlint` (regla `react(refs)`) recomienda no devolver la ref dentro del objeto del hook; el `<audio>` se monta en la raíz con la ref creada en `App.jsx` | Documentado en §3.1 (orden 8) |
| El ancho mínimo de 320 px se aplica con la utilidad `min-w-80`, no con una regla `body { min-width }` | El *Preflight* de Tailwind ya resuelve `box-sizing` y `margin`; evitar duplicar CSS propio (CA-02.3) | Documentado en §2.6 |
| El ícono decorativo de idioma se oculta por debajo de 400 px (`max-xs:hidden`) | En 320 px el selector ES/HN y la marca competían por el espacio | Verificado en `inicio-320px.png` |




