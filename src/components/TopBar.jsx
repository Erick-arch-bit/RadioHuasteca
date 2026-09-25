import { Languages, Menu, Radio, X } from 'lucide-react'
import { locales, translations } from '../i18n/translations'

// ---------------------------------------------------------------------------
// RadioHuasteca · Barra superior (HU-02, HU-13)
// El botón de menú es funcional: los hallazgos del Sprint 1 mostraban un botón
// que no respondía, que es condición de rechazo de HU-02.
// ---------------------------------------------------------------------------

export function TopBar({ children, copy, locale, menuOpen, onGoHome, onSelectLocale, onToggleMenu }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/84 backdrop-blur-[12px]">
      <div className="flex h-[76px] items-center gap-3.5 px-[clamp(18px,5vw,72px)] max-xs:h-[68px] max-xs:gap-2 max-xs:px-[13px]">
        <button
          type="button"
          data-testid="menu-toggle"
          aria-label={menuOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={onToggleMenu}
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-ink desk:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <button
          type="button"
          onClick={onGoHome}
          aria-label={copy.home}
          data-testid="brand"
          className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-left text-ink"
        >
          <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-forest text-paper shadow-[4px_4px_0_var(--color-sun)]">
            <Radio size={19} />
          </span>
          <span className="min-w-0">
            <strong className="block text-[17px] tracking-[.3px] max-xs:text-[15px]">{copy.brandName}</strong>
            <small className="block text-[10px] text-clay max-xs:text-[9px]">{copy.brandSubtitle}</small>
          </span>
        </button>

        <div
          role="group"
          aria-label={copy.languageSwitchLabel}
          className="ml-auto flex items-center gap-1 rounded-lg border border-line p-1"
        >
          <Languages size={16} className="ml-1 shrink-0 text-forest max-xs:hidden" aria-hidden="true" />
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              data-testid={`locale-${code}`}
              aria-pressed={locale === code}
              onClick={() => onSelectLocale(code)}
              className={
                locale === code
                  ? 'cursor-pointer rounded-md bg-forest px-2.5 py-1.5 text-[11px] font-extrabold text-paper'
                  : 'cursor-pointer rounded-md bg-transparent px-2.5 py-1.5 text-[11px] font-extrabold text-ink'
              }
            >
              {translations[code].label}
            </button>
          ))}
        </div>
      </div>

      {children}
    </header>
  )
}
