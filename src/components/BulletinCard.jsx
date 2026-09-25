import { BulletinPlayer } from './BulletinPlayer'

// ---------------------------------------------------------------------------
// RadioHuasteca · Tarjeta del último boletín (HU-03, HU-12)
// Ilustración hecha con utilidades Tailwind (cerros, río y sol), sin imágenes:
// pesa cero bytes y se ve bien en pantallas pequeñas.
// ---------------------------------------------------------------------------

export function BulletinCard({ copy, player, sources }) {
  return (
    <section
      aria-labelledby="bulletin-title"
      data-check-overflow
      className="mt-12 animate-reveal border border-line bg-paper shadow-[12px_12px_0_rgba(21,91,80,.09)] [animation-delay:80ms]"
    >
      <div className="flex justify-between gap-3 border-b border-line px-5 py-4 max-xs:px-3.5">
        <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">
          {copy.latestBulletin}
        </span>
        <span className="text-[10px] font-extrabold tracking-[.08em] text-forest">{copy.bulletinDate}</span>
      </div>

      <div
        aria-hidden="true"
        className="relative h-[180px] overflow-hidden bg-linear-to-br from-mist via-lagoon to-teal max-xs:h-[150px]"
      >
        <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,#fff_25%,#fff_27%,transparent_27%,transparent_75%,#fff_75%,#fff_77%,transparent_77%)] bg-[length:28px_28px] opacity-[.22]" />
        <span className="absolute top-[26px] right-[13%] size-[88px] rounded-full bg-sun shadow-[0_0_0_14px_rgba(242,184,75,.18)]" />
        <span className="absolute -bottom-9 -left-[8%] h-[140px] w-[70%] -rotate-7 skew-x-12 bg-forest-deep" />
        <span className="absolute -right-[22%] -bottom-12 h-[140px] w-[70%] rotate-7 -skew-x-12 bg-forest-darker" />
        <span className="absolute -left-[4%] bottom-[26px] h-8 w-[108%] -rotate-5 rounded-[50%] border-t-[3px] border-paper/80" />
        <em className="absolute right-5 bottom-4 z-[1] font-serif text-[21px] text-paper italic">Tének Tsabál</em>
      </div>

      <div className="px-[22px] pt-6 pb-[22px] desk:flex desk:justify-between desk:gap-7 max-xs:px-[15px]">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">{copy.bulletinKicker}</p>
          <h2
            id="bulletin-title"
            className="mt-1.5 mb-1.5 font-serif text-[27px] leading-[1.1] font-medium text-ink max-xs:text-[23px]"
          >
            {copy.bulletinTitle}
          </h2>
          <p className="text-xs text-water">{copy.audioLanguageTag}</p>
          <p className="mt-2 max-w-[380px] text-[13px] leading-normal text-muted">{copy.bulletinSummary}</p>
        </div>

        <BulletinPlayer copy={copy} player={player} sources={sources} />
      </div>
    </section>
  )
}
