// ---------------------------------------------------------------------------
// RadioHuasteca · Audio del último boletín (HU-03)
//
// El archivo vive en public/audio y se versiona en el repositorio: la app no
// depende de ningún servicio externo (requisito de baja conectividad).
// Se declaran dos formatos para que el navegador elija el más conveniente:
//   · Opus/Ogg  → el más ligero para voz (preferido).
//   · MP3       → respaldo para Safari / iOS y navegadores antiguos.
//
// Para publicar el boletín real: sustituye los dos archivos conservando los
// nombres, o actualiza las rutas de aquí y vuelve a ejecutar la verificación
// (ver README §"Boletín de prueba" y scripts/generate-bulletin-audio.sh).
// ---------------------------------------------------------------------------

/** Prefijo de despliegue de Vite (`/` por defecto); en Node cae a `/`. */
const baseUrl = import.meta.env?.BASE_URL ?? '/'

export const audioSources = [
  {
    id: 'opus',
    src: `${baseUrl}audio/boletin-demo.opus`,
    type: 'audio/ogg; codecs=opus',
    description: 'Opus 24 kbps, 16 kHz mono',
  },
  {
    id: 'mp3',
    src: `${baseUrl}audio/boletin-demo.mp3`,
    type: 'audio/mpeg',
    description: 'MP3 48 kbps, 22.05 kHz mono',
  },
]

export const bulletin = {
  id: 'boletin-demo',
  /** `true` mientras se trate del audio de demostración del Sprint 1. */
  isDemo: true,
  /**
   * Duración real de la demostración, medida con ffprobe al generarla.
   * La interfaz NO usa este valor para mostrar el tiempo: usa los metadatos
   * del propio archivo (`loadedmetadata`) y este dato solo documenta/verifica.
   */
  demoDurationSeconds: 60.9,
  audioSources,
}

/** Fuente principal (Opus). La comprobación estática también la usa. */
export const primaryAudioSource = audioSources[0].src
