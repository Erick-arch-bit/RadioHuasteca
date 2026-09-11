# Radio Universitaria — Plataforma de Radio Comunitaria Universitaria

## Descripción del Proyecto

**Radio Universitaria** es una plataforma de radio comunitaria universitaria en línea diseñada para servir como medio de comunicación entre la universidad y sus estudiantes, docentes y personal administrativo. Su propósito principal es mantener informada a la comunidad universitaria sobre trámites, procesos administrativos, actividades académicas, eventos y demás temas de interés.

### Concepto de Radio Comunitaria

Este proyecto se basa en el modelo de **radio comunitaria**, no simplemente un reproductor de radio en línea. Según la UNESCO, las radios comunitarias funcionan *"en la comunidad, para la comunidad, sobre la comunidad y por la comunidad"*. En este sentido, Radio Universitaria cumple con los siguientes principios:

1. **Comunidad objetivo**: La comunidad universitaria (estudiantes, docentes, personal administrativo).
2. **Finalidad social**: Servir como medio de comunicación sin fines de lucro, atendiendo necesidades informativas de la comunidad.
3. **Participación comunitaria**: Los usuarios pueden proponer temas, enviar noticias, reportar información, compartir opiniones y proponer eventos.
4. **Contenido de interés**: Información sobre trámites, actividades académicas, eventos, cultura y educación.
5. **Inclusión**: Da voz a personas que no siempre tienen representación en los medios tradicionales.

### ¿Qué NO es este proyecto?

No es un simple reproductor de música en línea. No es una estación de radio FM comercial. Es una **plataforma digital de comunicación comunitaria** que utiliza la radio en línea como uno de sus medios de difusión.

## Estructura del Proyecto

```
radio-universitaria/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── data/
    │   └── radioData.js
    └── components/
        ├── Sidebar.jsx
        ├── WorkspaceHeader.jsx
        ├── PlayerHero.jsx
        ├── Trámites.jsx
        ├── Programas.jsx
        ├── Noticias.jsx
        ├── Eventos.jsx
        ├── CommunityFeed.jsx
        ├── Participa.jsx
        ├── LivePodcasts.jsx
        ├── RightRail.jsx
        └── PostModal.jsx
```

## Secciones de la Plataforma

### 1. Inicio
Página principal con resumen de avisos importantes, trámites destacados y últimas noticias.

### 2. En Vivo
Transmisión en vivo de la radio universitaria con programación actual y reproductor de audio.

### 3. Trámites
Guía interactiva para que los estudiantes encuentren información sobre:
- Inscripciones
- Reinscripciones
- Titulación
- Servicio Social
- Prácticas Profesionales
- Becas
- Constancias
- Credenciales

### 4. Programas
Catálogo de programas de radio con horarios, descripciones y hosts.

### 5. Noticias
Noticias y novedades de la comunidad universitaria.

### 6. Eventos
Calendario de eventos académicos, culturales y deportivos.

### 7. Participa
Sección de participación comunitaria donde los usuarios pueden:
- 📰 Enviar noticias
- 🎙️ Proponer programas
- 📢 Reportar información
- 💬 Enviar opiniones
- 📅 Compartir eventos

## Stack Tecnológico

- **React 19** - Framework de interfaz de usuario
- **Vite** - Herramienta de build y desarrollo
- **JavaScript (ES6+)** - Lenguaje de programación
- **CSS** - Estilos con variables CSS y diseño responsivo

## Objetivos del Proyecto

### Objetivo General
Desarrollar una plataforma web de radio comunitaria universitaria en línea que facilite la difusión de información, contenidos culturales y educativos, así como la participación activa de los integrantes de la comunidad universitaria mediante herramientas digitales.

### Objetivos Específicos
1. Proporcionar un medio digital de comunicación comunitaria universitaria.
2. Facilitar la difusión de información local y trámites académicos.
3. Permitir la transmisión de programas de radio en línea.
4. Crear espacios de participación ciudadana universitaria.
5. Permitir que los usuarios propongan y compartan contenidos.
6. Difundir eventos y actividades comunitarias.
7. Promover contenidos culturales y educativos.
8. Facilitar el acceso a la información desde dispositivos con Internet.

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa
npm run preview

# Linting
npm run lint
```

## Metodología

El proyecto sigue una **metodología híbrida** (combinación de Agile y Waterfall) para la gestión del desarrollo, permitiendo tener un plan general definido mientras se itera en ciclos de desarrollo incremental.

## Licencia

Proyecto académico - Todos los derechos reservados.
