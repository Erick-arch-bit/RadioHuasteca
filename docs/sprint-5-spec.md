# Sprint 5 · Estabilización y candidata

## Objetivo y alcance

Consolidar las funciones heredadas de Sprints 1–4, priorizando seguridad de archivos, autenticación, moderación, avisos, rendimiento, accesibilidad y verificación reproducible. El Sprint conserva React 19, Vite 8, Express 5 y PostgreSQL.

## Diagnóstico inicial

| Área | Estado observado | Riesgo / siguiente paso |
| --- | --- | --- |
| Inicio, boletín y cápsulas | Implementados; audio local y respaldo declarado | Prueba real entre navegadores y estados queda manual |
| Avisos | Semillas más altas locales en `localStorage`; formulario visible sin sesión | No es administración compartida ni publicación autenticada |
| Trámites | API PostgreSQL y datos semilla | Validar DB activa y datos operativos antes de publicar |
| Login | Cookie firmada, HttpOnly, SameSite=Strict, Secure en producción; expira en 8 h | Token firmado sin revocación de servidor; probar 401/403/expiración |
| Fonoteca | Metadatos PostgreSQL, medios en `private-media`, carga autenticada | Falta análisis antivirus y validación completa por decodificador |
| Buzón / moderación | Envío privado pendiente, aprobación/rechazo e historial | Falta matriz integral repetible en DB aislada y limpieza de huérfanos |
| Responsive y accesibilidad | Estilos mobile-first y etiquetas presentes | No se ejecutó auditoría completa en este entorno |
| Avisos persistentes | No implementado | Decisión recomendada: tabla PostgreSQL y CRUD administrativo; migración compatible antes de retirar `localStorage` |

## Requisitos y aceptación

- Mantener las funciones de los cuatro sprints previos y los límites de privacidad de archivos.
- Las rutas protegidas deben distinguir 401 (sin sesión) de 403 (rol insuficiente).
- Los avisos administrativos deben persistir en PostgreSQL y sólo los publicados aparecer en público; la implementación actual no cumple este criterio.
- Archivos ciudadanos comienzan privados y pendientes; sólo aprobados se exponen públicamente.
- Formularios no deben duplicar envíos al reintentar.
- Probar las vistas a 320, 360, 390 px y escritorio, además de red 2G/3G/offline, audio y accesibilidad.
- `npm run verify:sprint5` debe comprobar condiciones reales y devolver error ante fallo automatizado.

## Cambios en esta entrega

Se añade `verify:sprint5` con comprobaciones estáticas de las barreras existentes y ejecución real de lint/build. No se cambia el modelo de avisos porque eliminar la demo local o sustituirla sin CRUD autenticado completo puede perder contenido local y presentar datos no publicados. Para completar la decisión: migración aditiva `notices`, endpoints públicos/admin protegidos, formulario dentro del panel y periodo de compatibilidad documentado.

## Riesgos y dependencias

PostgreSQL y credenciales no se verificaron durante este turno. Chromium/ffprobe no están disponibles según la ejecución de Sprint 1. No hay herramienta de red móvil ni lector de pantalla configurado. El directorio `private-media` no se inspecciona para evitar exponer contenido sensible. No se crea commit, etiqueta ni respaldo automático: hay cambios preexistentes sin confirmar en el árbol de trabajo.
