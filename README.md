# RadioHuasteca · Sprint 1

Base visual de RadioHuasteca construida con React y Vite.

## Alcance entregado

- Inicio mobile-first con último boletín de prueba.
- Reproductor con estados de carga, reproducción, pausa, detención y error.
- Navegación por iconos entre Inicio, Avisos, Trámites y Sobre la radio.
- Regreso al inicio sin perder el contexto del boletín.
- Estructura bilingüe inicial en español y espacio identificado para Hñähñu.
- Estilos comprobables en 320 px, 360 px y 390 px sin scroll horizontal.

## Ejecutar

```bash
npm install
npm run dev
```

Para validar la compilación de producción:

```bash
npm run build
```

El audio de prueba se carga desde el ejemplo público de MDN en `src/App.jsx` y debe sustituirse por el boletín real cuando esté disponible.

## Dirección visual

La paleta parte de referencias documentales sobre la Huasteca: verdes de la vegetación, turquesa de sus ríos y cascadas, terracota del barro y crema de manta. Los colores son una interpretación de diseño, no una paleta oficial única de la región.

## Criterios Sprint 1

| Criterio | Implementación |
| --- | --- |
| HU-02 Navegación | Menú inferior y accesos rápidos con iconos Lucide y rutas internas |
| HU-03 Último boletín | Audio de prueba con play, pause, stop y estados visibles |
| HU-12 Mobile-first | Layout fluido con breakpoints y ancho mínimo de 320 px |
| HU-13 Bilingüismo | Etiquetas prioritarias en español y espacio explícito para Hñähñu |
| Técnica | React + Vite, estructura `src`, README y build de producción |
