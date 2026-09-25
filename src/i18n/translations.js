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
    navProcedures: 'Trámites',
    navAbout: 'Sobre la radio',
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

    draftTitle: 'Hñähñu en revisión',
    draftNotice:
      'Estructura en Hñähñu preparada: la traducción está pendiente de validación con hablantes de la comunidad y no es una versión final.',
    draftBadge: 'Borrador',

    sprintNote: 'Sprint 1 · interfaz inicial / versión de prueba',
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

  draftTitle: 'Hñähñu en revisión',
  draftNotice:
    'Estructura en Hñähñu preparada: la traducción está pendiente de validación con hablantes de la comunidad y no es una versión final.',
  draftBadge: 'Borrador',

  sprintNote: 'Tsabál 1 · tsabál inicial',
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

