import { Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// RadioHuasteca · Controles del reproductor (HU-03)
// Contrato de UI y máquina de estados: docs/sprint-1-spec.md §2.1.2 y §2.1.3
// ---------------------------------------------------------------------------

const STATUS_KEY = {
  idle: 'stateIdle',
  loading: 'stateLoading',
  playing: 'statePlaying',
  paused: 'statePaused',
  error: 'stateError',
}

const HINT_KEY = {
  idle: 'hintIdle',
  loading: 'hintLoading',
  playing: 'hintPlaying',
  paused: 'hintPaused',
  error: 'hintError',
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00'
  const total = Math.floor(seconds)
  const minutes = String(Math.floor(total / 60)).padStart(2, '0')
  const rest = String(total % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}

export function BulletinPlayer({ copy, player, sources }) {
  const { state, duration, currentTime, currentSrc, isPlaying, progress } = player
  const toggleLabel = isPlaying ? copy.pause : state === 'paused' ? copy.resume : copy.play
  const timeLabel =
    duration > 0
      ? `${formatTime(currentTime)} / ${formatTime(duration)}`
      : `00:00 / ${copy.timePlaceholder}`

  return (
    <div
      data-testid="bulletin-player"
      data-state={state}
      data-audio-src={currentSrc || sources[0].src}
      className="mt-6 w-full desk:mt-0 desk:min-w-[255px] desk:max-w-[320px]"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="player-toggle"
          aria-label={toggleLabel}
          aria-pressed={isPlaying}
          onClick={player.togglePlayback}
          className="grid size-[52px] shrink-0 cursor-pointer place-items-center rounded-full bg-clay pl-1 text-paper shadow-[4px_4px_0_rgba(183,95,66,.2)] hover:bg-forest"
        >
          {isPlaying ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}
        </button>

        <div className="min-w-0 flex-1">
          <strong
            data-testid="player-status"
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-ink"
          >
            {copy[STATUS_KEY[state]]}
          </strong>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/60">
            <Volume2 size={14} aria-hidden="true" /> {copy[HINT_KEY[state]]}
          </span>
        </div>

        <button
          type="button"
          data-testid="player-stop"
          aria-label={copy.stop}
          onClick={player.stopPlayback}
          className="cursor-pointer border-0 bg-transparent p-2 text-ink/50 hover:text-clay"
        >
          <Square size={16} fill="currentColor" />
        </button>
      </div>

      <div
        data-testid="player-progress"
        role="progressbar"
        aria-label={copy.progressLabel}
        aria-valuemin={0}
        aria-valuemax={Math.max(Math.round(duration), 1)}
        aria-valuenow={Math.round(currentTime)}
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p data-testid="player-time" className="text-[10px] font-extrabold tracking-[.08em] text-forest tabular-nums">
          {timeLabel}
        </p>
        {state === 'error' ? (
          <button
            type="button"
            data-testid="player-retry"
            onClick={player.retryPlayback}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-clay bg-clay/10 px-2.5 py-1.5 text-[11px] font-extrabold text-clay"
          >
            <RotateCcw size={13} aria-hidden="true" /> {copy.retry}
          </button>
        ) : null}
      </div>
    </div>
  )
}
