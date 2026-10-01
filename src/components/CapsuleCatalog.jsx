import { Pause, Play, Radio, Square } from 'lucide-react'
import { capsuleItems } from '../data/notices'

export function CapsuleCatalog({ copy, activeId, playbackState, onPlay, onPause, onStop }) {
  return (
    <section data-testid="capsules-view" data-check-overflow className="animate-reveal">
      <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">RadioHuasteca · Sprint 2</span>
      <h1 className="mt-2 font-serif text-[clamp(32px,8vw,48px)] leading-tight text-ink">{copy.capsulesTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-muted">{copy.capsulesIntro}</p>
      <p className="mb-4 rounded border border-line bg-paper/70 p-3 text-xs leading-relaxed text-muted">{copy.capsuleDemoNotice}</p>
      <div className="grid gap-3">
        {capsuleItems.map((capsule) => {
          const selected = activeId === capsule.id
          const playing = selected && playbackState === 'playing'
          return <article key={capsule.id} data-testid="capsule-card" className="rounded-lg border border-line bg-paper p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lagoon text-forest"><Radio size={21} /></span>
              <div className="min-w-0 flex-1">
                <h2 className="break-words font-serif text-lg leading-snug text-ink">{capsule.title}</h2>
                <p className="mt-1 text-xs text-muted">{capsule.category} · {capsule.language} · {capsule.duration}</p>
                <p className="mt-1 text-[11px] text-muted">{capsule.src[0].type.includes('mpeg') ? 'MP3 · 48 kbps' : copy.capsuleFormat} · {capsule.size}</p>
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
