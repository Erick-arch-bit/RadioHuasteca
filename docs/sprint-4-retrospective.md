# Retrospectiva · Sprint 4

**Sprint:** Fonoteca, administración de audios y buzón ciudadano
**Fecha:** 14 de octubre de 2026

## Objetivo

Incorporar gestión de audios, participación ciudadana con envío de audio/video y revisión humana antes de publicar, conservando la aplicación React y el backend Express/PostgreSQL de los sprints anteriores.

## Qué quedó implementado

- Carga de audio autenticada con ficha de metadatos y asociación al operador.
- Fonoteca pública con filtro, selección, metadatos y reproducción.
- Buzón adaptable a móvil con recepción privada de audio/video y estado inicial `PENDIENTE`.
- Moderación con aprobación/rechazo, títulos públicos y bitácora de transiciones. El evento inicial se atribuye al sistema; las decisiones se atribuyen a la cuenta revisora.
- Rutas privadas para los archivos ciudadanos pendientes/rechazados y publicación únicamente después de aprobar.
- Migración aditiva de base de datos y documentación para ejecutar las pruebas restantes.

## Qué funcionó bien

- La implementación se integró en la arquitectura existente sin añadir paquetes de runtime.
- Se reutilizó PostgreSQL para metadatos, estados, roles e historial, y se dejó el almacenamiento de medios fuera de la carpeta pública.
- Las verificaciones repetibles de compilación, lint, arranque, migración y rechazo por falta de sesión quedaron documentadas.

## Qué mejorar

- Falta registrar una demostración integral con medios reales: carga operadora, envío móvil, aprobación y rechazo.
- La firma del archivo ayuda a detectar contenido mal etiquetado, pero no reemplaza un análisis antivirus ni una decodificación completa del medio. Antes de producción conviene definir límites de duración/resolución, escaneo y políticas de retención.
- La escritura de archivo y el registro PostgreSQL son operaciones en dos recursos distintos. Debe añadirse una rutina de limpieza de archivos huérfanos y recuperación ante caída entre ambos pasos.
- La evidencia visual y las pruebas de autorización 401/403 deben guardarse en `docs/evidence/sprint-4/`; en esta revisión solo se comprobó 401 sin sesión.

## Acciones siguientes

1. Capturar el flujo completo en móvil y escritorio con archivos de prueba representativos.
2. Agregar pruebas de integración automatizadas para formatos inválidos, límite de tamaño, estados y aislamiento de privacidad.
3. Definir roles operativos separados si se necesita impedir que algunos operadores moderen.
4. Validar formatos y peso máximo con quienes administrarán la radio y asegurar respaldo/retención del directorio privado.

## Prompt de Sprint 4

Espacio reservado para subir o pegar el prompt original usado para solicitar el sprint. Sustituir el marcador por el archivo o texto aprobado cuando se incorpore.

<!-- Pegar aquí el prompt o añadir un enlace a su archivo de evidencia. -->

**Archivo/enlace del prompt:** _Pendiente de agregar._
