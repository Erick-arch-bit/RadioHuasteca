import { HeartHandshake, Radio, ShieldCheck } from 'lucide-react'

export function AboutView({ copy }) {
  return (
    <section className="mx-auto max-w-3xl animate-reveal">
      <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">RadioHuasteca</p>
      <h1 className="mt-2 font-serif text-[clamp(38px,9vw,56px)] text-ink">Sobre la radio</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Una plataforma comunitaria para escuchar información local, consultar trámites y compartir avisos de Santa Ana Hueytlalpan.
      </p>
      <div className="mt-7 grid gap-3 desk:grid-cols-3">
        {[
          [Radio, 'Información cercana', 'Boletines, cápsulas y trámites disponibles con bajo consumo de datos.'],
          [HeartHandshake, 'Participación', 'La comunidad puede enviar avisos y mensajes privados a la radio.'],
          [ShieldCheck, 'Revisión responsable', 'El contenido ciudadano pasa por moderación antes de publicarse.'],
        ].map(([Icon, title, description]) => (
          <article key={title} className="rounded-2xl border border-line bg-paper p-4">
            <Icon className="text-forest" size={24} aria-hidden="true" />
            <h2 className="mt-3 font-serif text-xl text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
          </article>
        ))}
      </div>
      <p className="mt-7 rounded-xl border border-sun bg-paper p-4 text-sm text-muted">
        {copy.sprintNote}. La información oficial debe confirmarse con la radio y las autoridades correspondientes.
      </p>
    </section>
  )
}
