import { useEffect } from 'react'
import { navigationItems } from '../data/navigation'

// ---------------------------------------------------------------------------
// RadioHuasteca · Menú móvil (HU-02)
// Se abre y se cierra: al elegir una opción, con la tecla Escape o al tocar el
// fondo. En escritorio (≥ 681 px) desaparece porque la navegación inferior y
// los accesos rápidos ya ofrecen todos los destinos.
// ---------------------------------------------------------------------------

export function MobileMenu({ copy, onClose, onSelect }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      id="mobile-menu"
      data-testid="mobile-menu"
      aria-label={copy.menuTitle}
      className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_12px_24px_rgba(23,61,56,.08)] desk:hidden"
    >
      <nav aria-label={copy.navigationLabel} className="grid gap-1 px-[13px] py-3">
        {navigationItems.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`menu-item-${id}`}
            onClick={() => onSelect(id)}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-cream/60 px-3 py-2.5 text-left text-ink active:bg-cream"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-leaf text-forest">
              <Icon size={18} />
            </span>
            <span className="text-sm font-extrabold">{copy[labelKey]}</span>
          </button>
        ))}
      </nav>
      <p className="px-[13px] pb-3 text-[11px] text-muted">{copy.brandName} · {copy.location}</p>
    </div>
  )
}
