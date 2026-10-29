# Rendimiento · Sprint 5

## Registro de medición

**Estado: PENDIENTE.** El entorno no ofreció Chromium ni Lighthouse/DevTools accesible para limitar la red. No se afirma cumplimiento de la meta de carga inicial inferior a 3 s.

| Fecha/hora | Navegador/versión | Dispositivo / resolución | Red | Ejecución | Carga inicial | LCP | JS | CSS | Imágenes | Audio inicial / posterior |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| No medida | No disponible | No disponible | 3G simulada pendiente | — | — | — | — | — | — | — |

## Datos de build disponibles

`npm run build` produjo CSS de 34.28 kB (7.32 kB gzip) y JavaScript de 290.30 kB (88.21 kB gzip). Son tamaños de archivos compilados, no bytes realmente transferidos por navegador ni tiempo de carga. El audio del boletín se solicita con `preload="metadata"`; la transferencia real debe comprobarse en Network.

## Procedimiento reproducible

Servir el build con `npm run preview`, abrir DevTools > Network, fijar un perfil 3G y viewport/documentar dispositivo, limpiar caché antes de cada una de tres corridas, recargar y exportar cada informe Lighthouse HAR/JSON. Registrar DOMContentLoaded, load, LCP, bytes por tipo y distinguir recursos iniciales frente a posteriores. Repetir en 2G y Offline para comportamiento, no para comparar la meta 3G. No guardar datos privados en HAR.

## Problemas y optimizaciones

No se detectó recurso pesado mediante análisis de red en esta ejecución. No se aplicaron optimizaciones especulativas; optimizar sólo después de identificar solicitudes bloqueantes o transferencia anticipada con informe real.
