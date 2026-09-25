import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// RadioHuasteca · Máquina de estados del reproductor (HU-03)
// Especificación: docs/sprint-1-spec.md §2.1.2
//
//   idle → loading → playing ⇄ paused
//                       ↓
//                     error (con reintento)
//
// Reglas:
//  · Una reproducción cancelada (AbortError) NO es un error.
//  · La duración viene de los metadatos reales del archivo.
//  · Detener lleva el audio a 0 y el estado de vuelta a `idle`.
// ---------------------------------------------------------------------------

export const AUDIO_STATES = {
  idle: 'idle',
  loading: 'loading',
  playing: 'playing',
  paused: 'paused',
  error: 'error',
}

/**
 * Controla el elemento <audio> del boletín.
 *
 * @param {{ current: HTMLAudioElement | null }} audioRef
 *   Ref creada por la vista que monta el <audio> (React desaconseja devolver
 *   refs dentro del objeto de un hook: así el acceso queda explícito).
 */
export function useBulletinAudio(audioRef) {
  /** Evita que el evento `pause` provocado por "Detener" se lea como pausa. */
  const stoppedRef = useRef(false)

  const [state, setState] = useState(AUDIO_STATES.idle)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentSrc, setCurrentSrc] = useState('')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const readTime = () => setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0)
    const readDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)

    const handleLoadedMetadata = () => {
      readDuration()
      readTime()
      setCurrentSrc(audio.currentSrc || audio.src || '')
    }
    const handlePlaying = () => {
      stoppedRef.current = false
      readTime()
      setState(AUDIO_STATES.playing)
    }
    const handlePause = () => {
      if (audio.ended || stoppedRef.current) {
        setState(AUDIO_STATES.idle)
        return
      }
      setState((previous) => (previous === AUDIO_STATES.error ? previous : AUDIO_STATES.paused))
    }
    const handleEnded = () => {
      stoppedRef.current = true
      setCurrentTime(0)
      setState(AUDIO_STATES.idle)
    }
    const handleWaiting = () => {
      setState((previous) =>
        previous === AUDIO_STATES.playing || previous === AUDIO_STATES.paused
          ? AUDIO_STATES.loading
          : previous,
      )
    }
    const handleError = () => setState(AUDIO_STATES.error)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', readDuration)
    audio.addEventListener('timeupdate', readTime)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('canplay', readDuration)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', readDuration)
      audio.removeEventListener('timeupdate', readTime)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('canplay', readDuration)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('error', handleError)
    }
  }, [audioRef])

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    stoppedRef.current = false
    if (audio.ended) {
      try {
        audio.currentTime = 0
      } catch {
        // Sin metadatos todavía: el navegador reinicia solo al reproducir.
      }
    }
    setState(AUDIO_STATES.loading)
    try {
      await audio.play()
      // El paso a `playing` lo confirma el evento homónimo del elemento.
    } catch (error) {
      if (error?.name === 'AbortError') return
      setState(AUDIO_STATES.error)
    }
  }, [audioRef])

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    void attemptPlay()
  }, [audioRef, attemptPlay])

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    stoppedRef.current = true
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      // Sin metadatos todavía: nada que reiniciar.
    }
    setCurrentTime(0)
    setState(AUDIO_STATES.idle)
  }, [audioRef])

  const retryPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.load()
    setCurrentTime(0)
    void attemptPlay()
  }, [audioRef, attemptPlay])

  /** Se conecta a cada <source>: si el último formato también falla → error. */
  const reportSourceError = useCallback(() => setState(AUDIO_STATES.error), [])

  return {
    state,
    duration,
    currentTime,
    currentSrc,
    isPlaying: state === AUDIO_STATES.playing,
    progress: duration > 0 ? Math.min(currentTime / duration, 1) : 0,
    togglePlayback,
    stopPlayback,
    retryPlayback,
    reportSourceError,
  }
}
