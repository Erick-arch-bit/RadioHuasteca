# RadioHuasteca

Plataforma web de **radio comunitaria indígena de baja conectividad** para **Santa Ana Hueytlalpan, Hidalgo**. Reúne los avisos de la comunidad, los boletines de audio y los contenidos bilingües en **español y Hñähñu**, pensados primero para celulares de gama baja y conexiones lentas.

Este repositorio corresponde al **Sprint 1**: estructura inicial móvil, navegación por iconos, textos prioritarios bilingües y reproducción del último boletín.

| Documento | Contenido |
| --- | --- |
| [`docs/sprint-1-spec.md`](docs/sprint-1-spec.md) | Especificación técnica (Spec-Driven Development): comportamiento, estados, criterios de aceptación y evidencias requeridas |
| [`docs/sprint-1-verification.md`](docs/sprint-1-verification.md) | Resultado de la verificación y cómo reproducir cada evidencia |
| [`docs/evidence/sprint-1/`](docs/evidence/sprint-1/) | Capturas por ancho de pantalla e informe automático |

## Stack

| Capa | Tecnología |
| --- | --- |
| Interfaz | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 con el plugin `@tailwindcss/vite` |
| Iconos | lucide-react |
| Lint | oxlint |
| Audio | archivos Opus (preferido) y MP3 (respaldo) versionados en `public/audio/` |

Sin backend, sin base de datos y sin servicios externos: la versión del Sprint 1 funciona por completo de forma local.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Cómo instalar y ejecutar

```bash
npm install
npm run dev
npm run build
npm run preview
```

Comandos adicionales:

```bash
npm run lint             # análisis estático (oxlint)
npm run verify:sprint1   # verificación automática de los criterios del Sprint 1
npm run audio:generate   # regenera el audio de prueba del boletín
```

## Estructura del proyecto

```
src/
  App.jsx                     composición de la pantalla de inicio y del cambio de vista
  index.css                   tokens de Tailwind v4 (@theme) y regla global de foco
  components/                 TopBar, MobileMenu, LanguageDraftNotice, WelcomeBlock,
                              BulletinCard, BulletinPlayer, BulletinAudio, QuickNav,
                              InnerView, BottomNav
  hooks/useBulletinAudio.js   máquina de estados del reproductor del boletín
  data/bulletin.js            fuentes de audio (Opus + MP3) y metadatos del boletín
  data/navigation.js          destinos, iconos y claves de texto de la navegación
  i18n/translations.js        diccionarios ES / Hñähñu (con aviso de borrador)
public/audio/                 audio real del boletín (Opus preferido, MP3 de respaldo)
scripts/                      generación del audio y verificación automática
docs/                         especificación, evidencias y capturas
```

## Tailwind CSS en este proyecto

Tailwind v4 se activa con el plugin oficial de Vite (`vite.config.js`) y una sola hoja base:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-ink: #173d38;   /* token de color → habilita bg-ink, text-ink, border-ink… */
  --font-serif: Georgia, 'Times New Roman', serif;
  --breakpoint-desk: 681px; /* punto de cambio móvil/escritorio del Sprint 1 */
  --breakpoint-xs: 400px;   /* celulares pequeños: 320 px, 360 px y 390 px */
}
```

**Reglas del proyecto**

1. La interfaz se escribe con **utilidades Tailwind**; no se añaden hojas de estilo por componente. `src/App.css` fue eliminado en el Sprint 1.
2. Todo valor de la identidad visual pasa por un token de `@theme` (colores, tipografía, breakpoints) para que exista una sola fuente de verdad.
3. El único CSS propio que se conserva está en `src/index.css` y está justificado en la especificación (§2.6): el import de Tailwind, los tokens, la animación `reveal` y el foco visible global.
4. Mobile-first: las utilidades base describen el celular y sólo se añade comportamiento con los breakpoints `xs` y `desk`.

**Ejemplos reales usados en el Sprint 1**

| Necesidad | Clases usadas |
| --- | --- |
| Tarjeta del boletín con sombra desplazada | `border border-line bg-paper shadow-[12px_12px_0_rgba(21,91,80,.09)]` |
| Layout de una columna en celular y dos en escritorio | `desk:flex desk:justify-between desk:gap-7` |
| Ajuste fino en pantallas de 320–390 px | `max-xs:px-[13px] max-xs:text-[23px]` |
| Tipografía del título de bienvenida | `text-[clamp(39px,12vw,62px)] desk:text-[clamp(42px,6vw,76px)]` |
| Ilustración de cerros, río y sol sin imágenes | `-rotate-7 skew-x-12 bg-forest-deep`, `rounded-[50%] border-t-[3px] border-paper/80` |
| Botones táctiles de la navegación inferior | `flex min-h-11 flex-col items-center …` |
| Animación de entrada | `animate-reveal [animation-delay:80ms]` |

**Verificar que Tailwind está activo**

```bash
npm run build && grep -o "681px" dist/assets/*.css | head -1
```

El CSS compilado debe contener el breakpoint `681px` declarado en `@theme` (`npm run verify:sprint1` lo comprueba automáticamente).

## Boletín de prueba (audio)

El reproductor usa un **archivo real versionado en el repositorio**, no un CDN externo:

| Archivo | Formato | Peso | Uso |
| --- | --- | --- | --- |
| `public/audio/boletin-demo.opus` | Ogg Opus 24 kbps, 16 kHz mono | ~160 KB | Primera opción: el más ligero para voz y baja conectividad |
| `public/audio/boletin-demo.mp3` | MP3 48 kbps, 22.05 kHz mono | ~360 KB | Respaldo para Safari/iOS y navegadores antiguos |

El elemento `<audio>` declara los dos formatos como `<source>` y el navegador elige el que puede reproducir. El elemento vive en la raíz de la aplicación, por lo que **cambiar de vista no interrumpe el boletín**.

**Sustituir el audio de prueba por el boletín real de la comunidad**

1. Coloca el audio definitivo conservando los nombres `boletin-demo.opus` y `boletin-demo.mp3` (o actualiza las rutas en `src/data/bulletin.js`).
2. Cambia `isDemo: true` por `isDemo: false` en `src/data/bulletin.js`.
3. Ajusta las etiquetas del boletín (título, resumen, fecha) en `src/i18n/translations.js`.
4. Ejecuta `npm run verify:sprint1` para confirmar que el nuevo archivo pesa menos de 1.5 MB y dura más de 20 segundos.

**Regenerar el audio de demostración** (requiere `ffmpeg` con `libopus`/`libmp3lame` y `espeak-ng`):

```bash
npm run audio:generate
```

El guion `scripts/generate-bulletin-audio.sh` contiene el texto narrado y la cadena de filtros (normalización a −16 LUFS), de modo que el resultado es reproducible.

## Estados del reproductor

El hook `src/hooks/useBulletinAudio.js` implementa esta máquina de estados (especificada en `docs/sprint-1-spec.md` §2.1.2):

| Estado | Texto en pantalla (ES) | Cómo se entra |
| --- | --- | --- |
| `idle` | Listo para escuchar | al abrir la página, después de detener o al terminar el boletín |
| `loading` | Cargando audio… | al pulsar "Escuchar boletín" mientras el navegador carga o espera datos |
| `playing` | Reproduciendo boletín | cuando el elemento `<audio>` confirma la reproducción |
| `paused` | Boletín en pausa | al pulsar el mismo botón mientras suena |
| `error` | No fue posible reproducir el audio. | si el archivo falla; aparece el botón "Reintentar" |

El botón principal alterna entre "Escuchar boletín", "Pausar boletín" y "Continuar boletín"; el botón cuadrado detiene y reinicia el tiempo a `00:00`. La duración mostrada sale de los metadatos reales del archivo (`loadedmetadata`), nunca de un valor escrito a mano.

## Estructura bilingüe (ES / Hñähñu)

- El selector **ES / HN** de la barra superior cambia todos los textos de la interfaz (`src/i18n/translations.js`).
- Mientras el idioma Hñähñu esté marcado como **borrador**, se muestra un aviso que aclara que la traducción está **pendiente de validación con hablantes de la comunidad**. No se presentan textos provisionales como traducción terminada.
- Las claves que aún no tienen propuesta en Hñähñu conservan el texto en español y quedan cubiertas por ese aviso. `npm run verify:sprint1` informa cuántas claves están en cada situación.

## Cómo reproducir las evidencias

### 1. Verificación automática (recomendada)

```bash
npm install
npm run verify:sprint1
```

El guion realiza tres bloques de comprobaciones sin dependencias adicionales:

1. **Estáticas**: peso y duración real del audio, ausencia de URLs externas y de audio sintético, paridad de claves ES/Hñähñu, Tailwind activo, ausencia de código de sprints futuros, README e `index.html`.
2. **Build**: `npm run build` y revisión de que el CSS compilado incluye el breakpoint del proyecto y de que el audio se publica en `dist/`.
3. **Interfaz real** (Chromium headless vía CDP, sirviendo `npm run preview`): ausencia de scroll horizontal en 320/360/390 px, alturas táctiles, ciclo completo de reproducción con audio real, estado de error y recuperación, menú móvil, `aria-current`, continuidad del audio al navegar, cambio de idioma y consola sin errores.

Salidas:

- `docs/evidence/sprint-1/verification-report.md` — informe con el resultado de cada criterio.
- `docs/evidence/sprint-1/*.png` — capturas: `inicio-320px.png`, `inicio-360px.png`, `inicio-390px.png`, `reproduciendo-360px.png`, `pausado-360px.png`, `error-360px.png`, `hnahnu-360px.png`, `escritorio-1280px.png`.

Si `chromium` no está disponible, las pruebas de interfaz se omiten (se muestran como OMITIDAS) y se pueden hacer a mano.

### 2. Matriz manual de anchos (HU-12)

1. `npm run dev` y abrir `http://localhost:5173`.
2. DevTools → modo dispositivo → probar **320 × 568**, **360 × 640** y **390 × 844**.
3. Comprobar en cada ancho: no hay scroll horizontal, el texto no se corta, los botones de la barra inferior se distinguen y alcanzan con el pulgar, y se puede tocar "Escuchar boletín".

### 3. Reproducción y estados (HU-03)

1. Pulsar "Escuchar boletín" → debe sonar el boletín y mostrarse "Reproduciendo boletín".
2. Pulsar otra vez → "Boletín en pausa"; pulsar de nuevo → continúa desde donde iba.
3. Pulsar el botón de detener → vuelve a "Listo para escuchar" y el tiempo a `00:00`.
4. En DevTools → Red, simular **Slow 3G** o marcar "Sin conexión" y reproducir: debe verse "Cargando audio…" o "No fue posible reproducir el audio." con el botón "Reintentar", sin bloquear la página ni arrojar errores en consola.
5. Repetir la escucha en un celular real conectado al servidor de la red local.

## Alcance del Sprint 1

| Historia | Criterio | Implementación |
| --- | --- | --- |
| HU-02 | Navegación | Menú móvil funcional (abre/cierra con Escape y con el fondo), barra inferior con `aria-current`, accesos rápidos y regreso a Inicio sin perder el boletín |
| HU-03 | Último boletín | Audio real versionado (Opus + MP3), cinco estados visibles, play/pausa/detener, progreso y tiempo reales, recuperación ante error |
| HU-12 | Mobile-first | Layout fluido verificado en 320, 360 y 390 px sin scroll horizontal |
| HU-13 | Estructura bilingüe | Diccionarios ES / Hñähñu con aviso de traducción pendiente de validación |
| Técnica | Repositorio | React + Vite + Tailwind CSS, README, `npm run build` y verificación automática |

**Fuera de alcance en este sprint** (previsto para los siguientes): avisos comunitarios, fonoteca o catálogo de audios, trámites con apoyo auditivo, inicio de sesión, panel de administración, buzón de participación ciudadana, backend Node/Express y base de datos PostgreSQL.

## Accesibilidad y rendimiento

- Todos los controles tienen etiqueta accesible (`aria-label`), el estado del reproductor se anuncia con `role="status"` y `aria-live="polite"`, y el destino activo se marca con `aria-current="page"`.
- Foco visible global (`:focus-visible`) definido en la hoja base.
- Botones táctiles de al menos 44 px de alto en la navegación inferior.
- Sin librerías añadidas al plan original, audio ligero (Opus ≈ 160 KB) y `preload="metadata"` para no descargar el boletín completo al abrir la página.

## Dirección visual

La paleta parte de referencias de la Huasteca: verdes de la vegetación, turquesa de sus ríos y cascadas, terracota del barro y crema de manta. Los colores son una interpretación de diseño, no una paleta oficial única de la región. Los tokens viven en `src/index.css` (`@theme`), de modo que cualquier ajuste visual se hace en un solo lugar.


