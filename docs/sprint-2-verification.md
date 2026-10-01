# Verificación · Sprint 2 · RadioHuasteca

Los criterios y el plan están en [`sprint-2-spec.md`](./sprint-2-spec.md). La evidencia automática se genera en [`evidence/sprint-2/verification-report.md`](./evidence/sprint-2/verification-report.md), junto con las capturas PNG.

## Cómo repetir la verificación

Requisitos: Node.js/npm, Chrome instalado y dependencias instaladas. En una consola inicia `npm run dev`; en otra ejecuta `npm run verify:sprint2`. Si Chrome no se detecta automáticamente, configura `CHROMIUM_BIN` con la ruta completa de `chrome.exe`. El script recorre la UI con Chrome headless, realiza los flujos y guarda las capturas en `docs/evidence/sprint-2/`.

Comprueba anchos de 320, 360 y 390 px, metadatos/filtros de avisos, inicio de audio urgente, controles de cápsulas, validación de seis campos requeridos, alta/persistencia local y reproducción/pausa/detención del boletín original. Las dimensiones, el resultado por criterio y los archivos están en el informe automático.

## Recursos de prueba

Los medios versionados son `public/audio/boletin-demo.opus` (160,115 bytes, Opus/Ogg, 24 kbps nominal) y `public/audio/boletin-demo.mp3` (365,907 bytes, MP3, 48 kbps nominal). Los dos elementos del catálogo usan el mismo audio de demostración en dos formatos; no representan cápsulas reales de la comunidad. No se incorporan imágenes de red: la ilustración del Sprint 1 se dibuja con CSS. La interfaz anuncia que los avisos también son ilustrativos.

## Limitaciones conocidas

- El registro no autentica operadores y no publica ni sincroniza avisos: usa `localStorage` de un navegador para la demostración.
- Los textos Hñähñu añadidos a Sprint 2 permanecen en español y se presentan bajo el aviso de traducción en borrador; necesitan revisión con hablantes.
- Antes de producción, reemplazar los avisos/audio demo y conectar el formulario con backend autenticado y almacenamiento compartido.
