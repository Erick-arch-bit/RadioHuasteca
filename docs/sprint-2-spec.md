# Especificación técnica · Sprint 2 · RadioHuasteca

> Desarrollo guiado por especificación (SDD). Flujo: **SPEC → PLAN → IMPLEMENT → VERIFY → DOCS**.
> Este documento define alcance y criterios antes de los cambios de código.

- Proyecto: RadioHuasteca, radio comunitaria de baja conectividad para Santa Ana Hueytlalpan, Hidalgo.
- Sprint: 2 — avisos comunitarios y catálogo básico de audios.
- Base: React 19, Vite 8 y Tailwind CSS 4; sin servidor ni servicios externos.
- Historias del plan: HU-01, HU-04, HU-07, HU-12 e Integración/Regresión.

## 1. Objetivo y decisiones

Permitir consultar avisos por prioridad, escuchar cápsulas comprimidas y capturar avisos en una interfaz móvil liviana. Como el proyecto todavía no tiene backend ni autenticación, el registro de administración es una demostración local: datos semilla más persistencia en `localStorage` del navegador. No es publicación compartida ni control de acceso.

Los avisos llevarán título, prioridad, fecha, icono por tipo, estado y descripción. La prioridad crítica tendrá tratamiento visual y una acción para oír el audio de muestra. Los filtros permitirán revisar prioridad y estado. El formulario exigirá título, descripción, prioridad, tipo, fecha y estado; el audio será opcional. Al guardar, se valida, se agrega el aviso y se persiste localmente.

El catálogo de cápsulas mostrará nombre, categoría, idioma, duración estimada y tamaño/formato. Un único elemento de audio compartido administra reproducir, pausar y detener sin recargar; navegar no desmonta el reproductor ni el boletín del Sprint 1. Los medios de muestra serán locales, reutilizando los recursos comprimidos versionados del proyecto para evitar dependencias de red y descargas adicionales.

## 2. Criterios de aceptación verificables

### HU-01 · Avisos

- **CA-01.1** Cada tarjeta muestra título, prioridad, fecha, icono de tipo y estado.
- **CA-01.2** Prioridades urgente, alta y normal se distinguen mediante etiqueta y tratamiento visual; urgente incluye icono/señal además del color.
- **CA-01.3** El aviso urgente con audio presenta un control audible asociado al archivo local.
- **CA-01.4** Filtros de prioridad y estado actualizan el listado sin recargar; un estado vacío ofrece explicación y acción para limpiar filtros.

### HU-04 · Catálogo de cápsulas

- **CA-04.1** Cada cápsula lista título y metadatos (categoría, idioma, formato/tamaño y duración).
- **CA-04.2** Los controles reproducen, pausan y detienen el elemento seleccionado; el estado se anuncia y navegar por la app no recarga la página.
- **CA-04.3** Los controles tienen etiquetas accesibles; la fuente es local y usa preload de metadatos.

### HU-07 · Registro local de avisos

- **CA-07.1** El formulario requiere título, descripción, prioridad, tipo, fecha y estado; el navegador y la aplicación bloquean campos vacíos.
- **CA-07.2** Guardar crea el aviso y lo muestra inmediatamente en el listado con los campos y estado elegidos.
- **CA-07.3** Los datos nuevos se conservan al recargar el mismo navegador. Se muestra claramente que son datos locales de demostración, sin autenticación ni sincronización.

### HU-12 · Móvil / gama baja

- **CA-12.1** Las vistas de avisos, catálogo y registro no generan scroll horizontal a 320, 360 y 390 px.
- **CA-12.2** Controles táctiles principales tienen al menos 44 px de alto; contenido apilado en móvil.
- **CA-12.3** No se agregan dependencias, imágenes remotas ni audio sintético. Los recursos locales están comprimidos y cargan metadatos bajo demanda.

### Regresión Sprint 1

- **CA-R.1** El boletín conserva sus estados, progreso y reproducción/pausa/detención.
- **CA-R.2** El elemento de audio del boletín permanece montado al cambiar vistas.
- **CA-R.3** Build y lint sin errores; las pruebas de regresión de Sprint 1 continúan ejecutándose.

## 3. PLAN de implementación

1. Extender navegación a `inicio`, `avisos`, `capsulas`, `tramites` y `sobre`; añadir claves de interfaz a ambos diccionarios, dejando Hñähñu de Sprint 2 marcado como borrador cuando no haya validación.
2. Añadir datos semilla, persistencia local y lógica de alta/filtros en `src/data/notices.js` y `src/hooks/useNotices.js`.
3. Crear componentes de listado/tarjeta, formulario y catálogo con reproductor compartido de cápsulas; mantener el audio de boletín en la raíz.
4. Integrar vistas en `App.jsx` y navegación móvil/escritorio con Tailwind mobile-first.
5. Añadir una verificación reproducible y capturas en `docs/evidence/sprint-2/`; documentar resultados, limitaciones y operación en README.

## 4. Evidencia requerida y Definition of Done

- Capturas reales de avisos con distintas prioridades/estados, crítico con audio, catálogo, formulario y vista de 320 px.
- Registro de verificación de build, lint, validación del formulario, alta visible/persistente y regresión del reproductor del Sprint 1.
- SPEC, implementación y resultados documentados; build y lint exitosos; criterios no verificables quedan explícitamente reportados.

