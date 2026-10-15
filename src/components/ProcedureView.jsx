import { useEffect, useState } from 'react'
import { ArrowLeft, Headphones, Volume2 } from 'lucide-react'
import { procedures as demoProcedures } from '../data/procedures'

const API = import.meta.env?.VITE_API_URL ?? ''

function ProcedureAudio({ procedure }) {
  const [state, setState] = useState('idle')
  if (!procedure.audio) return <p className="mt-4 text-sm text-muted">Este trámite no tiene audio.</p>
  return (
    <div className="mt-5 rounded-xl border border-line bg-cream/70 p-4">
      <div className="flex items-center gap-2 font-bold text-ink"><Headphones size={19} /> Audio de este trámite</div>
      <p className="mt-1 text-xs text-muted">Idioma: {procedure.audio.language}{procedure.audio.voice ? ` · voz: ${procedure.audio.voice}` : ''}{procedure.audio.demo ? ' · audio de demostración' : ''}</p>
      <audio
        className="mt-3 w-full"
        controls
        preload="none"
        src={procedure.audio.src}
        aria-label={`Audio del trámite ${procedure.title}`}
        onLoadStart={() => setState('loading')}
        onCanPlay={() => setState('ready')}
        onPlaying={() => setState('playing')}
        onPause={() => setState('ready')}
        onError={() => setState('error')}
      />
      <p role="status" aria-live="polite" className="mt-2 text-xs text-muted">
        {state === 'loading' ? 'Cargando audio…' : state === 'error' ? 'No fue posible cargar el audio de este trámite. Revisa la conexión e intenta de nuevo.' : state === 'playing' ? 'Reproduciendo el audio de este trámite.' : state === 'ready' ? 'Audio listo.' : 'Pulsa reproducir para cargar el audio.'}
      </p>
    </div>
  )
}

export function ProcedureView({ locale = 'es' }) {
  const [selectedId, setSelectedId] = useState(null)
  const [procedures, setProcedures] = useState(demoProcedures)
  useEffect(() => {
    fetch(`${API}/api/procedures`).then(async (response) => {
      if (!response.ok) return
      const rows = await response.json()
      if (!Array.isArray(rows) || rows.length === 0) return
      setProcedures(rows.map((row) => ({
        id: row.id, title: row.title, summary: row.summary, requirements: row.requirements, steps: row.steps,
        responsible: row.responsible, validity: row.validity, priority: row.priority,
        audio: row.audio_url ? { src: row.audio_url, language: row.audio_language === 'hnh' ? 'Hñähñu' : 'Español', voice: row.audio_voice, demo: row.audio_is_demo } : null,
        hnhStatus: row.translations?.hnh?.status === 'pending_validation' ? 'Pendiente de traducción y validación comunitaria' : 'Revisar estado de traducción',
      })))
    }).catch(() => {})
  }, [])
  const selected = procedures.find((procedure) => procedure.id === selectedId)
  return (
    <section data-testid="procedure-view" className="animate-reveal">
      <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">Catálogo de trámites</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-[clamp(38px,9vw,56px)] text-ink">Trámites</h1>
        <span className="rounded-full bg-paper px-3 py-2 text-xs font-bold text-forest">Idioma: {locale === 'hnh' ? 'Hñähñu · borrador' : 'Español'}</span>
      </div>
      {locale === 'hnh' && <p className="mt-3 rounded-lg border border-sun bg-paper p-3 text-sm">La información de trámites en Hñähñu está pendiente de traducción y validación con hablantes de la comunidad. Se muestra en español como referencia.</p>}
      <p className="mt-3 text-sm leading-relaxed text-muted">Información de demostración. Confirma requisitos, responsables y vigencia con la oficina correspondiente.</p>
      {selected ? (
        <article className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-[8px_8px_0_rgba(21,91,80,.08)] desk:p-7" data-testid="procedure-detail">
          <button
            type="button"
            data-testid="procedure-back-button"
            onClick={() => { setSelectedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border-0 bg-forest px-4 font-bold text-paper shadow-sm hover:bg-forest-darker"
          >
            <ArrowLeft size={18} aria-hidden="true" /> Volver al catálogo de trámites
          </button>
          <h2 className="mt-5 font-serif text-3xl text-ink">{selected.title}</h2>
          <p className="mt-2 text-sm text-muted">{selected.summary}</p>
          <div className="mt-6 grid gap-5 desk:grid-cols-2">
            <div><h3 className="font-bold text-ink">Requisitos</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">{selected.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h3 className="font-bold text-ink">Pasos</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted">{selected.steps.map((item) => <li key={item}>{item}</li>)}</ol></div>
          </div>
          <div className="mt-5 space-y-2 rounded-xl bg-cream/70 p-4 text-sm"><p><strong>Responsable / referencia:</strong> {selected.responsible}</p>{selected.validity && <p><strong>Vigencia:</strong> {selected.validity}</p>}<p className="text-muted"><strong>Hñähñu:</strong> {selected.hnhStatus}</p></div>
          <ProcedureAudio key={selected.id} procedure={selected} />
        </article>
      ) : (
        <div className="mt-6 grid gap-4 desk:grid-cols-2">
          {procedures.map((procedure) => <article key={procedure.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-paper p-5">
            <div className="flex items-start gap-3"><Volume2 size={20} className="mt-1 shrink-0 text-forest" /><div><h2 className="font-serif text-xl text-ink">{procedure.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{procedure.summary}</p></div></div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5"><span className="text-xs font-bold text-forest">{procedure.audio ? 'Incluye audio' : 'Información escrita'}</span><button type="button" onClick={() => setSelectedId(procedure.id)} className="min-h-11 rounded-lg bg-forest px-4 font-bold text-paper">Ver trámite</button></div>
          </article>)}
        </div>
      )}
    </section>
  )
}
