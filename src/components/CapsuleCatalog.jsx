import { Pause, Play, Radio, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { capsuleItems } from '../data/notices'

const API = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '')
const fallbackAudio = '/audio/boletin-demo.mp3'

export function CapsuleCatalog({ copy, activeId, playbackState, onPlay, onPause, onStop }) {
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`${API}/api/audios`)
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudo cargar el catálogo de cápsulas.')
        return response.json()
      })
      .then((items) => {
        if (cancelled) return
        if (!Array.isArray(items)) throw new Error('La API devolvió un catálogo inválido.')
        setCapsules(items.map((item) => ({
          ...item,
          duration: `${String(Math.floor((item.duration_seconds ?? 0) / 60)).padStart(2, '0')}:${String((item.duration_seconds ?? 0) % 60).padStart(2, '0')}`,
          size: item.file_size ? `${Math.round(item.file_size / 1024)} KB` : '',
          src: [{ src: item.audio_url?.startsWith('https://example.com/') ? fallbackAudio : item.audio_url || `${API}/api/media/${item.id}`, type: 'audio/mpeg' }],
        })))
      })
      .catch((reason) => { if (!cancelled) { setCapsules(capsuleItems); setError(`Sin conexión. Se muestra el catálogo guardado. ${reason.message}`) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <section data-testid="capsules-view" data-check-overflow className="animate-reveal">
      <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">RadioHuasteca · Sprint 2</span>
      <h1 className="mt-2 font-serif text-[clamp(32px,8vw,48px)] leading-tight text-ink">{copy.capsulesTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-muted">{copy.capsulesIntro}</p>
      {loading ? <p role="status" className="rounded border border-line bg-paper p-4 text-sm text-muted">Cargando cápsulas…</p> : null}
      {error ? <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-paper p-4 text-sm text-muted"><span>{error}</span><button onClick={()=>window.location.reload()} className="min-h-10 rounded-lg bg-forest px-3 font-bold text-white">Reintentar</button></div> : null}
      {!loading && !error && capsules.length === 0 ? <p className="rounded border border-line bg-paper p-4 text-sm text-muted">Todavía no hay cápsulas publicadas.</p> : null}
      <div className="grid gap-3">
        {capsules.map((capsule) => {
          const selected = activeId === capsule.id
          const playing = selected && playbackState === 'playing'
          return <article key={capsule.id} data-testid="capsule-card" className="rounded-lg border border-line bg-paper p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lagoon text-forest"><Radio size={21} /></span>
              <div className="min-w-0 flex-1">
                <h2 className="break-words font-serif text-lg leading-snug text-ink">{capsule.title}</h2>
                <p className="mt-1 text-xs text-muted">{capsule.category} · {capsule.language} · {capsule.duration}</p>
                {capsule.size ? <p className="mt-1 text-[11px] text-muted">{capsule.size}</p> : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" data-testid={`capsule-play-${capsule.id}`} aria-label={`${playing ? copy.pauseCapsule : copy.playCapsule}: ${capsule.title}`} onClick={() => playing ? onPause() : onPlay(capsule)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-forest px-3 text-xs font-extrabold text-white">{playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}{playing ? copy.capsulePauseVerb : copy.capsulePlayVerb}</button>
              <button type="button" data-testid={`capsule-stop-${capsule.id}`} aria-label={`${copy.stopCapsule}: ${capsule.title}`} onClick={onStop} disabled={!selected} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3 text-xs font-bold text-ink disabled:opacity-45"><Square size={14} fill="currentColor" />{copy.capsuleStopVerb}</button>
              <span role="status" aria-live="polite" className="text-[11px] text-muted">{selected ? (playbackState === 'playing' ? copy.capsulePlaying : playbackState === 'paused' ? copy.capsulePaused : playbackState === 'error' ? copy.capsuleError : copy.capsuleIdle) : copy.capsuleIdle}</span>
            </div>
          </article>
        })}
      </div>
    </section>
  )
}
