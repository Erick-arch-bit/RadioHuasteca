// ---------------------------------------------------------------------------
// RadioHuasteca · Textos de interfaz (HU-13)
//
// Reglas de este archivo (ver docs/sprint-1-spec.md §2.4):
//  1. Es un módulo SIN JSX: el script de verificación lo importa en Node para
//     comprobar que `es` y `hnh` tienen exactamente las mismas claves.
//  2. El Hñähñu es una ESTRUCTURA EN BORRADOR: no se inventan traducciones.
//     Las claves que aún no tienen propuesta en Hñähñu conservan el texto en
//     español (lengua de trabajo de la comunidad) y la interfaz muestra el
//     aviso `draftNotice` para no hacerlo pasar por traducción terminada.
//  3. Ninguna cadena puede quedar vacía.
// ---------------------------------------------------------------------------

export const defaultLocale = 'es'

/** Códigos internos usados en el selector ES/HN. `hnh` es provisional. */
export const locales = ['es', 'hnh']

export const translations = {
  es: {
    label: 'ES',
    languageName: 'Español',
    languageSwitchLabel: 'Elegir idioma de la interfaz',

    brandName: 'RadioHuasteca',
    brandSubtitle: 'La voz de aquí',
    location: 'Santa Ana Hueytlalpan, Hidalgo',

    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    menuTitle: 'Menú principal',
    home: 'Volver a inicio',

    navHome: 'Inicio',
    navNotices: 'Avisos',
    navCapsules: 'Cápsulas',
    navProcedures: 'Trámites',
    navAbout: 'Sobre',
    navigationLabel: 'Navegación principal',

    live: 'Al aire desde la Huasteca',
    titleLineOne: 'Lo que pasa aquí,',
    titleLineTwo: 'se escucha aquí.',
    intro: 'Información cercana, historias de la comunidad y la música que nos reúne.',

    latestBulletin: 'Último boletín',
    bulletinDate: '23 SEP 2026',
    bulletinKicker: 'Boletín comunitario',
    bulletinTitle: 'La palabra de nuestra gente',
    bulletinSummary: 'Boletín de prueba: así se escuchará el boletín de la comunidad.',
    audioLanguageTag: 'Audio en español',

    playerRegionLabel: 'Reproductor del último boletín',
    play: 'Escuchar boletín',
    pause: 'Pausar boletín',
    resume: 'Continuar boletín',
    stop: 'Detener boletín',
    stateIdle: 'Listo para escuchar',
    stateLoading: 'Cargando audio…',
    statePlaying: 'Reproduciendo boletín',
    statePaused: 'Boletín en pausa',
    stateError: 'No fue posible reproducir el audio.',
    hintIdle: 'Pulsa para escuchar',
    hintLoading: 'Preparando el audio',
    hintPlaying: 'Boletín de prueba del Sprint 1',
    hintPaused: 'Pulsa para continuar',
    hintError: 'Revisa tu conexión e intenta de nuevo',
    retry: 'Reintentar',
    progressLabel: 'Avance del boletín',
    timePlaceholder: '--:--',

    quickKicker: 'Explora la radio',
    quickTitle: '¿Qué necesitas hoy?',
    quickHint: 'Elige una ruta',

    back: 'Volver al inicio',
    route: 'Ruta comunitaria',
    viewIntro:
      'Esta vista quedará disponible en el siguiente incremento. La navegación y el regreso conservan el contexto del boletín.',
    preparing: 'Contenido en preparación',

    noticesTitle: 'Avisos de la comunidad',
    noticesIntro: 'Información importante para nuestra comunidad.',
    noticeDemoNotice: 'Avisos de muestra: títulos y fechas ilustrativos; no son información oficial de la comunidad.',
    priority: 'Prioridad',
    status: 'Estado',
    type: 'Tipo de aviso',
    date: 'Fecha',
    description: 'Descripción',
    urgent: 'Urgente',
    high: 'Alta',
    normal: 'Normal',
    active: 'Activo',
    resolved: 'Resuelto',
    scheduled: 'Programado',
    weather: 'Clima',
    water: 'Agua',
    health: 'Salud',
    community: 'Comunidad',
    all: 'Todos',
    filterPriority: 'Filtrar por prioridad',
    filterStatus: 'Filtrar por estado',
    noNotices: 'No hay avisos con estos filtros.',
    clearFilters: 'Limpiar filtros',
    listenNotice: 'Escuchar aviso',
    adminForm: 'Registrar aviso',
    demoLocal: 'Demostración local: los avisos guardados solo aparecen en este navegador.',
    requiredFields: 'Completa todos los campos obligatorios.',
    saveNotice: 'Guardar aviso',
    noticeSaved: 'Aviso guardado y agregado al listado.',
    noticeTitle: 'Título',
    attachDemoAudio: 'Adjuntar audio de prueba',
    capsuleDemoNotice: 'Audios de demostración local. El catálogo comparte muestras comprimidas Opus y MP3.',
    capsulesTitle: 'Cápsulas de audio',
    capsulesIntro: 'Mensajes breves para escuchar cuando puedas.',
    capsuleSummary: 'Resumen comunitario de prueba',
    capsuleWeather: 'Aviso de temporada · audio de prueba',
    capsuleLanguage: 'Español',
    capsuleFormat: 'Opus · 24 kbps',
    capsuleSize: '160 KB',
    playCapsule: 'Reproducir cápsula',
    pauseCapsule: 'Pausar cápsula',
    stopCapsule: 'Detener cápsula',
    capsuleIdle: 'Lista para escuchar',
    capsulePlaying: 'Reproduciendo cápsula',
    capsulePaused: 'Cápsula en pausa',
    capsuleError: 'No se pudo reproducir la cápsula.',
    noticeError: 'No se pudo guardar el aviso.',
    capsulePlayVerb: 'Reproducir',
    capsulePauseVerb: 'Pausar',
    capsuleStopVerb: 'Detener',

    draftTitle: 'Hñähñu en revisión',
    draftNotice:
      'Estructura en Hñähñu preparada: la traducción está pendiente de validación con hablantes de la comunidad y no es una versión final.',
    draftBadge: 'Borrador',

    sprintNote: 'Sprint 2 · avisos y cápsulas de prueba',
  },
}

// El diccionario en Hñähñu se añade abajo con la misma lista de claves.
translations.hnh = {
  label: 'HN',
  languageName: 'Hñähñu',
  languageSwitchLabel: 'Elegir idioma de la interfaz',

  brandName: 'RadioHuasteca',
  brandSubtitle: "Inik t'ojlal",
  location: 'Santa Ana Hueytlalpan, Hidalgo',

  openMenu: 'Ajan menú',
  closeMenu: 'Cerrar menú',
  menuTitle: 'Ajan principal',
  home: 'Tsal an Tsabál',

  navHome: 'Tsabál',
  navNotices: 'Aylal',
  navCapsules: 'Cápsulas',
  navProcedures: 'Ajan',
  navAbout: 'In tin radio',
  navigationLabel: 'Ajan principal',

  live: 'Tsal an Huasteca',
  titleLineOne: 'Axi inik,',
  titleLineTwo: 'tsabál an inik.',
  intro: 'Tsal, aylal ani tsabál an comunidad.',

  latestBulletin: "Ne'ets",
  bulletinDate: '23 / 09 / 2026',
  bulletinKicker: 'Tsabál Tének',
  bulletinTitle: 'Tsabál an inik',
  bulletinSummary: 'Boletín de prueba: así se escuchará el boletín de la comunidad.',
  audioLanguageTag: 'Audio en español · Hñähñu en revisión',

  playerRegionLabel: 'Reproductor del último boletín',
  play: 'Tsabál',
  pause: 'Kubat',
  resume: 'Tsabál',
  stop: 'Kubat tsabál',
  stateIdle: 'Kawil tsabál',
  stateLoading: 'Kawil tsabál',
  statePlaying: 'Tsabál anik',
  statePaused: 'Kubat',
  stateError: 'Axi tsabál',
  hintIdle: 'Tsabál',
  hintLoading: 'Kawil tsabál',
  hintPlaying: 'Boletín de prueba del Sprint 1',
  hintPaused: 'Kubat',
  hintError: 'Revisa tu conexión e intenta de nuevo',
  retry: 'Tsabál juni',
  progressLabel: 'Avance del boletín',
  timePlaceholder: '--:--',

  quickKicker: 'Ajan radio',
  quickTitle: '¿Axi?',
  quickHint: 'Ajan',

  back: 'Tsal an Tsabál',
  route: 'Ajan an comunidad',
  viewIntro: 'Axi tsabál an incremento. Ajan ani regreso.',
  preparing: 'Tsabál an kawil',

  noticesTitle: 'Aylal an comunidad',
  noticesIntro: 'Aylal importante an comunidad.',
  noticeDemoNotice: 'Avisos de muestra: títulos y fechas ilustrativos; no son información oficial de la comunidad.',
  priority: 'Prioridad',
  status: 'Estado',
  type: 'Tipo de aviso',
  date: 'Fecha',
  description: 'Descripción',
  urgent: 'Urgente',
  high: 'Alta',
  normal: 'Normal',
  active: 'Activo',
  resolved: 'Resuelto',
  scheduled: 'Programado',
  weather: 'Clima',
  water: 'Agua',
  health: 'Salud',
  community: 'Comunidad',
  all: 'Todos',
  filterPriority: 'Filtrar por prioridad',
  filterStatus: 'Filtrar por estado',
  noNotices: 'No hay avisos con estos filtros.',
  clearFilters: 'Limpiar filtros',
  listenNotice: 'Escuchar aviso',
  adminForm: 'Registrar aviso',
  demoLocal: 'Demostración local: los avisos guardados solo aparecen en este navegador.',
  requiredFields: 'Completa todos los campos obligatorios.',
  saveNotice: 'Guardar aviso',
  noticeSaved: 'Aviso guardado y agregado al listado.',
  noticeTitle: 'Título',
  attachDemoAudio: 'Adjuntar audio de prueba',
  capsuleDemoNotice: 'Audios de demostración local. El catálogo comparte muestras comprimidas Opus y MP3.',
  capsulesTitle: 'Cápsulas de audio',
  capsulesIntro: 'Mensajes breves para escuchar cuando puedas.',
  capsuleSummary: 'Resumen comunitario de prueba',
  capsuleWeather: 'Aviso de temporada · audio de prueba',
  capsuleLanguage: 'Español',
  capsuleFormat: 'Opus · 24 kbps',
  capsuleSize: '160 KB',
  playCapsule: 'Reproducir cápsula',
  pauseCapsule: 'Pausar cápsula',
  stopCapsule: 'Detener cápsula',
  capsuleIdle: 'Lista para escuchar',
  capsulePlaying: 'Reproduciendo cápsula',
  capsulePaused: 'Cápsula en pausa',
  capsuleError: 'No se pudo reproducir la cápsula.',
  noticeError: 'No se pudo guardar el aviso.',
  capsulePlayVerb: 'Reproducir',
  capsulePauseVerb: 'Pausar',
  capsuleStopVerb: 'Detener',

  draftTitle: 'Hñähñu en revisión',
  draftNotice:
    'Estructura en Hñähñu preparada: la traducción está pendiente de validación con hablantes de la comunidad y no es una versión final.',
  draftBadge: 'Borrador',

  sprintNote: 'Sprint 2 · avisos y cápsulas de prueba',
}

/** Idiomas cuyo contenido está en borrador y debe anunciarse como tal. */
export const draftLocales = ['hnh']

export function isDraftLocale(locale) {
  return draftLocales.includes(locale)
}

/**
 * Devuelve el diccionario de un idioma con respaldo en español.
 * Evita que un idioma incompleto rompa la interfaz.
 */
export function getCopy(locale) {
  return { ...translations[defaultLocale], ...(translations[locale] ?? {}) }
}
