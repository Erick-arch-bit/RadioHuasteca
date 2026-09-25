// ---------------------------------------------------------------------------
// RadioHuasteca · Bloque de bienvenida (HU-12, HU-13)
// Los textos llegan resueltos desde el diccionario del idioma activo.
// ---------------------------------------------------------------------------

export function WelcomeBlock({ copy }) {
  return (
    <section data-check-overflow className="max-w-[660px] animate-reveal">
      <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">
        <span
          aria-hidden="true"
          className="inline-block size-[7px] rounded-full bg-clay shadow-[0_0_0_4px_rgba(183,95,66,.13)]"
        />
        {copy.live}
      </p>
      <h1 className="mt-[18px] mb-5 font-serif text-[clamp(39px,12vw,62px)] leading-[.98] font-medium text-ink desk:text-[clamp(42px,6vw,76px)]">
        {copy.titleLineOne}
        <br />
        <em className="text-clay italic">{copy.titleLineTwo}</em>
      </h1>
      <p className="max-w-[540px] text-[15px] leading-[1.6] text-muted">{copy.intro}</p>
    </section>
  )
}
