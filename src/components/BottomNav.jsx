import { navigationItems } from '../data/navigation'

// ---------------------------------------------------------------------------
// RadioHuasteca · Navegación inferior (HU-02, HU-12)
// Los cuatro destinos con icono + etiqueta. Cada botón mide 44 px de alto como
// mínimo para poder usarse con el pulgar en celulares de gama baja.
// ---------------------------------------------------------------------------

export function BottomNav({ copy, activeView, onSelect }) {
  return (
    <nav
      data-testid="bottom-nav"
      aria-label={copy.navigationLabel}
      className="fixed bottom-0 left-1/2 z-20 grid w-[min(100%,720px)] -translate-x-1/2 grid-cols-4 border border-b-0 border-line bg-paper/95 px-2.5 pt-[9px] pb-2.5 shadow-[0_-8px_20px_rgba(23,61,56,.05)] desk:rounded-t-[14px] max-xs:px-1"
    >
      {navigationItems.map(({ id, labelKey, Icon }) => {
        const isActive = activeView === id
        return (
          <button
            key={id}
            type="button"
            data-testid={`nav-${id}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(id)}
            className={`flex min-h-11 cursor-pointer flex-col items-center gap-0.5 border-0 bg-transparent p-1 text-[10px] font-extrabold ${
              isActive ? 'text-forest' : 'text-ink/55'
            }`}
          >
            <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
            <span className="max-w-full truncate">{copy[labelKey]}</span>
          </button>
        )
      })}
    </nav>
  )
}
