import { Languages } from 'lucide-react'

// ---------------------------------------------------------------------------
// RadioHuasteca · Aviso de traducción en borrador (HU-13, CA-13.4)
// El Hñähñu no debe presentarse como traducción terminada: mientras el idioma
// esté marcado como borrador en src/i18n/translations.js, este aviso es visible.
// ---------------------------------------------------------------------------

export function LanguageDraftNotice({ copy }) {
  return (
    <p
      data-testid="draft-notice"
      role="note"
      className="flex items-start justify-center gap-2 border-b border-sun/60 bg-sun/20 px-[clamp(18px,5vw,72px)] py-2.5 text-[11px] leading-normal text-ink max-xs:px-[13px]"
    >
      <Languages size={15} className="mt-px shrink-0 text-clay" aria-hidden="true" />
      <span className="max-w-[880px]">
        <strong className="font-extrabold">{copy.draftTitle} · {copy.draftBadge}. </strong>
        {copy.draftNotice}
      </span>
    </p>
  )
}
