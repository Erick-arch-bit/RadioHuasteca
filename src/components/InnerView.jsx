import { ChevronLeft, CircleHelp } from 'lucide-react'

// ---------------------------------------------------------------------------
// RadioHuasteca · Vista interna (HU-02)
// Las secciones que aún no existen en el Sprint 1 solo muestran su ruta y su
// estado de preparación; el regreso a Inicio no reinicia el boletín porque el
// elemento <audio> vive en la raíz de la aplicación.
// ---------------------------------------------------------------------------

export function InnerView({ copy, item, onGoHome }) {
  const { Icon, labelKey } = item

  return (
    <section data-testid="inner-view" data-check-overflow className="min-h-[52vh] max-w-[620px] animate-reveal pt-2">
      <button
        type="button"
        data-testid="back-link"
        onClick={onGoHome}
        className="mb-[70px] inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-xs font-extrabold text-forest"
      >
        <ChevronLeft size={18} aria-hidden="true" /> {copy.back}
      </button>

      <div className="mb-5 grid size-14 place-items-center rounded-full bg-clay text-paper">
        <Icon size={25} aria-hidden="true" />
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">{copy.route}</span>
      <h1 className="mt-3.5 mb-[18px] font-serif text-[54px] font-medium text-ink max-xs:text-[40px]">
        {copy[labelKey]}
      </h1>
      <p className="max-w-[540px] text-[15px] leading-[1.6] text-muted">{copy.viewIntro}</p>

      <div className="mt-8 flex items-start gap-3 border-l-[3px] border-sun bg-paper/60 p-[18px] text-forest">
        <CircleHelp size={20} className="shrink-0" aria-hidden="true" />
        <span className="min-w-0">
          <strong className="block">{copy.preparing}</strong>
          <small className="mt-1 block text-xs text-muted-note">{copy.sprintNote}</small>
        </span>
      </div>
    </section>
  )
}
