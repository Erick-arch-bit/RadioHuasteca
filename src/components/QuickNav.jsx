import { secondaryItems } from '../data/navigation'

// ---------------------------------------------------------------------------
// RadioHuasteca · Accesos rápidos (HU-02)
// Una columna en móvil (≤ 680 px) y tres columnas en escritorio (≥ 681 px).
// ---------------------------------------------------------------------------

export function QuickNav({ copy, onSelect }) {
  return (
    <section data-check-overflow className="animate-reveal pt-[58px] [animation-delay:160ms]">
      <div className="mb-[18px] flex items-end justify-between">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">{copy.quickKicker}</span>
          <h2 className="mt-[7px] font-serif text-[27px] font-medium text-ink">{copy.quickTitle}</h2>
        </div>
        <span className="hidden font-serif text-sm text-clay italic desk:inline">{copy.quickHint} →</span>
      </div>

      <nav aria-label={copy.navigationLabel} className="grid grid-cols-1 gap-3 desk:grid-cols-3">
        {secondaryItems.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`quick-${id}`}
            onClick={() => onSelect(id)}
            className="flex min-h-[70px] cursor-pointer items-center gap-3 border border-line bg-paper/40 p-3.5 text-left text-ink transition-[transform,background-color] duration-200 hover:-translate-y-[3px] hover:bg-paper desk:min-h-[88px]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf text-forest">
              <Icon size={21} aria-hidden="true" />
            </span>
            <strong className="text-[13px]">{copy[labelKey]}</strong>
          </button>
        ))}
      </nav>
    </section>
  )
}
